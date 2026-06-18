const { WebSocketServer } = require('ws');

const FLASK_API_URL = 'http://localhost:5000';
const AI_CHAT_API = FLASK_API_URL + '/api/ai_chat/';
const RAG_INIT_API = FLASK_API_URL + '/api/rag/init/';
const RAG_QUERY_API = FLASK_API_URL + '/api/rag/query/';

const wss = new WebSocketServer({ host: '0.0.0.0', port: 3002 });

// Store conversation history per client
const clientHistories = new Map();

wss.on('connection', (ws) => {
  const clientId = Date.now().toString();
  clientHistories.set(clientId, []);

  console.log(`Client connected: ${clientId}`);

  ws.send(JSON.stringify({
    type: 'system',
    content: '你好！我是 AI Agent，有什么我可以帮助你的吗？你可以问我关于设备、配置、技术问题等。',
  }));

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log(`Received from ${clientId}:`, data);

      if (data.type === 'chat') {
        const history = clientHistories.get(clientId) || [];
        let useRag = false;
        let answer = null;
        let references = [];
        let source = 'ai';

        // First try RAG query for knowledge-based questions
        try {
          const ragResponse = await fetch(RAG_QUERY_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              question: data.content,
              top_k: 5
            }),
          });

          const ragResult = await ragResponse.json();

          if (ragResult.success && ragResult.data && ragResult.data.answer) {
            answer = ragResult.data.answer;
            references = ragResult.data.references || [];
            source = 'rag';
            useRag = true;
          }
        } catch (e) {
          console.log('RAG query failed, falling back to AI chat:', e.message);
        }

        // If RAG didn't find answer, use AI chat
        if (!useRag) {
          const chatResponse = await fetch(AI_CHAT_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: data.content,
              history: history,
            }),
          });

          const chatResult = await chatResponse.json();

          if (chatResult.success) {
            answer = chatResult.data;
            history.push({ role: 'user', content: data.content });
            history.push({ role: 'assistant', content: chatResult.data });
          } else {
            ws.send(JSON.stringify({
              type: 'error',
              content: chatResult.error || 'AI 服务调用失败',
            }));
            return;
          }
        }

        if (answer) {
          if (source === 'ai') {
            history.push({ role: 'user', content: data.content });
            history.push({ role: 'assistant', content: answer });
          }

          ws.send(JSON.stringify({
            type: 'assistant',
            content: answer,
            references: references,
            source: source
          }));
        }

      } else if (data.type === 'init_rag') {
        // Initialize RAG knowledge base
        try {
          const initResponse = await fetch(RAG_INIT_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          });

          const initResult = await initResponse.json();

          if (initResult.success) {
            ws.send(JSON.stringify({
              type: 'system',
              content: '知识库初始化成功！设备数量: ' + initResult.data.device_count + '，知识块: ' + initResult.data.chunk_count,
            }));
          } else {
            ws.send(JSON.stringify({
              type: 'error',
              content: '知识库初始化失败: ' + initResult.error,
            }));
          }
        } catch (e) {
          ws.send(JSON.stringify({
            type: 'error',
            content: '知识库初始化失败: ' + e.message,
          }));
        }

      } else if (data.type === 'clear') {
        clientHistories.set(clientId, []);
        ws.send(JSON.stringify({
          type: 'system',
          content: '对话已清除，开始新对话吧！',
        }));
      }
    } catch (error) {
      console.error('Error processing message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        content: '处理消息时发生错误，请稍后重试。',
      }));
    }
  });

  ws.on('close', () => {
    clientHistories.delete(clientId);
    console.log(`Client disconnected: ${clientId}`);
  });

  ws.on('error', (error) => {
    console.error(`WebSocket error for ${clientId}:`, error);
    clientHistories.delete(clientId);
  });
});

console.log('=================================');
console.log('WebSocket server running on ws://localhost:3002');
console.log('AI Chat API:', AI_CHAT_API);
console.log('RAG Init API:', RAG_INIT_API);
console.log('RAG Query API:', RAG_QUERY_API);
console.log('=================================');