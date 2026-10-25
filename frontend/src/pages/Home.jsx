
import Navbar from "../components/Navbar";
import LeftSidebar from "../components/LeftSidebar";
import Feed from "../components/Feed";
import RightSidebar from "../components/RightSidebar";

function Home() {
  return (
    <div className="min-h-dvh orbit-pattern-bg text-[#17182d] lg:flex lg:h-screen lg:min-h-0 lg:flex-col lg:overflow-hidden">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl px-4 py-4 lg:grid lg:min-h-0 lg:flex-1 lg:grid-cols-[260px_minmax(0,1fr)_290px] lg:gap-5 lg:overflow-hidden">
        <aside className="hidden min-h-0 overflow-hidden lg:block">
          <LeftSidebar />
        </aside>

        <section aria-label="Home feed" className="orbit-feed-scroll min-w-0 pb-24 pr-1 lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain lg:pb-2">
          <Feed hideComposerOnMobile />
        </section>

        <aside className="hidden min-h-0 overflow-hidden lg:block">
          <RightSidebar />
        </aside>
      </main>
    </div>
  );
}

export default Home;
