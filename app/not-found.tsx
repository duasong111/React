import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
      <FileQuestion className="size-16 text-muted-foreground" />
      <h1 className="text-3xl font-bold tracking-tight">页面未找到</h1>
      <p className="max-w-md text-muted-foreground">
        抱歉，您访问的页面不存在或已被移除。
      </p>
      <Button asChild className="mt-2">
        <Link href="/">返回首页</Link>
      </Button>
    </div>
  );
}
