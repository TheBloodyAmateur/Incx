import { Calendar, Folder, Cloud } from "lucide-react";
import { useNavigate } from "react-router-dom";
import GlassIcons from "./GlassIcons";
import ScrambledText from "./ScrambledText";

export default function AppFeatureIcons() {
    const navigate = useNavigate();

    const items = [
        {
            icon: <Calendar />,
            color: "deep_magenta",
            label: <ScrambledText>Kalender</ScrambledText>
        },
        {
            icon: <Folder />,
            color: "deep_sapphire",
            label: <ScrambledText>Files</ScrambledText>
        },
        {
            icon: <Cloud />,
            color: "deep_teal",
            label: <ScrambledText>Wetter</ScrambledText>,
            ariaLabel: "Wetter",
            onClick: () => navigate("/weather")
        }
    ];

    return <GlassIcons items={items} />;
}
