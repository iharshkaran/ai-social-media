
import Navbar from "../components/Navbar";
import LeftSidebar from "../components/LeftSidebar";
import Feed from "../components/Feed";
import RightSidebar from "../components/RightSidebar";

function Home() {
  return (
    <div className="flex h-screen min-h-0 flex-col overflow-hidden orbit-pattern-bg text-[#17182d]">
      <Navbar />

      <main className="mx-auto grid min-h-0 w-full max-w-7xl flex-1 grid-cols-1 gap-5 overflow-hidden px-4 py-4 lg:grid-cols-[260px_minmax(0,1fr)_290px]">
        <aside className="hidden min-h-0 overflow-hidden lg:block">
          <LeftSidebar />
        </aside>

        <section aria-label="Home feed" className="orbit-feed-scroll min-h-0 min-w-0 overflow-y-auto overscroll-contain pb-2 pr-1">
          <Feed />
        </section>

        <aside className="hidden min-h-0 overflow-hidden lg:block">
          <RightSidebar />
        </aside>
      </main>
    </div>
  );
}

export default Home;
