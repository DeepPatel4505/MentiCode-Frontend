import ActivePlayground from "../components/ActivePlayground.jsx";
import MyRepositories from "../components/MyRepositories.jsx";

function AnalyzeHome() {
    return (
        <section className="w-full max-w-7xl mx-auto p-6 px-0 pb-12 overflow-visible">
            <ActivePlayground />
            <MyRepositories />
        </section>
    );
}

export default AnalyzeHome;
