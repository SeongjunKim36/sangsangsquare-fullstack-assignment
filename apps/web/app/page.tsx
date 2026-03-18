import { Header } from "@/components/header";
import { MeetingList } from "@/components/meeting-list";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main id="main-content" className="flex-1 container mx-auto px-4 py-6">
        {/* 페이지 소개 */}
        <section className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">모집 중인 모임</h1>
          <p className="mt-2 text-muted-foreground">관심 있는 모임에 신청하고 함께 성장해요!</p>
        </section>

        {/* 모임 목록 */}
        <MeetingList />
      </main>

      {/* 푸터 */}
      <footer className="border-t py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2026 상상단 단톡방 모임. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
