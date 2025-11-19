import { useSearchParams } from "react-router-dom";
import Aurora from "../../components/aurora/Aurora";
import AppFeatureIcons from "../../components/ui/AppFeatureIcons";
import "./DashboardPage.css";

export default function DashboardPage() {
    const [searchParams] = useSearchParams();
    const username = searchParams.get('username');

    return (
        <div className="dashboard-wrapper">
            <Aurora
                colorStops={["#1A1A1A", "#46338A", "#0F6A77"]}
                blend={0.55}
                amplitude={1.0}
                speed={0.35}
            />
            <div className="center-content">
                <AppFeatureIcons username={username} />
            </div>
        </div>
    );
}
