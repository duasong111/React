"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
      <AlertTriangle className="size-16 text-destructive" />
      <h1 className="text-3xl font-bold tracking-tight">出错了</h1>
      <p className="max-w-md text-muted-foreground">
        抱歉，页面加载过程中发生了错误。
      </p>
      <div className="flex gap-2 mt-2">
        <Button onClick={unstable_retry} variant="default">
          重试
        </Button>
        <Button asChild variant="outline">
          <a href="/">返回首页</a>
        </Button>
      </div>
    </div>
  );
}
