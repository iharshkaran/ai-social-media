
import Navbar from "../components/Navbar";
import LeftSidebar from "../components/LeftSidebar";
import Feed from "../components/Feed";
import RightSidebar from "../components/RightSidebar";

function Home() {
  return (
    <div className="min-h-screen bg-[#111111] text-white">
      <Navbar />

      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-5 px-4 py-6 lg:grid-cols-[260px_minmax(0,1fr)_290px]">
        <aside className="hidden lg:block">
          <LeftSidebar />
        </aside>

        <section className="min-w-0">
          <Feed />
        </section>

        <aside className="hidden lg:block">
          <RightSidebar />
        </aside>
      </main>
    </div>
  );
}

export default Home;
