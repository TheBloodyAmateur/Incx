import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Aurora from "../../components/aurora/Aurora";
import AppFeatureIcons from "../../components/ui/AppFeatureIcons";
import ImprovementWrapper from '../../components/imp/ImprovementWrapper';
import { useUX } from '../../context/UXContext';
import "./DashboardPage.css";

export default function DashboardPage() {
    const [searchParams] = useSearchParams();
    const username = searchParams.get('username');
    const { loadImprovementsForPage } = useUX();

    useEffect(() => {
        loadImprovementsForPage('DashboardPage');
    }, []);

    return (
        <ImprovementWrapper>
            <div id="dashboard-wrapper" className="dashboard-wrapper">
                <Aurora
                    colorStops={["#1A1A1A", "#46338A", "#0F6A77"]}
                    blend={0.55}
                    amplitude={1.0}
                    speed={0.35}
                />
                <div id="feature-grid" className="center-content">
                    <AppFeatureIcons id="app-feature-icons" username={username} />
                </div>
            </div>
        </ImprovementWrapper>
    );
}
