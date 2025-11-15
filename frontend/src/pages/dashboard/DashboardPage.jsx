import Aurora from "../../components/aurora/Aurora";
import AppFeatureIcons from "../../components/ui/AppFeatureIcons";
import "./DashboardPage.css";

export default function DashboardPage() {
    return (
        <div className="dashboard-wrapper">
            <Aurora
                colorStops={["#5227FF", "#7CFF67", "#5227FF"]}
                blend={0.5}
                amplitude={1.0}
                speed={0.5}
            />

            <div className="center-content">
                <AppFeatureIcons />
            </div>
        </div>
    );
}
