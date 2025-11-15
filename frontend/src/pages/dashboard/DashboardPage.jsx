import Aurora from "../../components/aurora/Aurora";
import AppFeatureIcons from "../../components/ui/AppFeatureIcons";
import "./DashboardPage.css";

export default function DashboardPage() {
    return (
        <div className="dashboard-wrapper">
            <Aurora
                colorStops={["#1A1A1A", "#46338A", "#0F6A77"]}
                blend={0.55}
                amplitude={1.0}
                speed={0.35}
            />

            <div className="center-content">
                <AppFeatureIcons />
            </div>
        </div>
    );
}
