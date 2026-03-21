import { Header } from "@/components/header";
import { MeetingList } from "@/components/meeting-list";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main id="main-content" className="flex-1 container mx-auto px-4 py-6">
        <section className="mb-8 space-y-3">
          <p className="text-sm font-medium text-primary">상상단 자기계발 모임</p>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            함께 성장할 모임을 찾아보세요
          </h1>
          <p className="max-w-2xl text-muted-foreground">
            기록, 운동, 독서, 영어까지. 관심 있는 모임을 살펴보고 발표일 전까지 신청할 수 있어요.
          </p>
        </section>

        <MeetingList />
      </main>

      {/* 푸터 */}
      <footer className="border-t py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2026 상상단. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
