import { Calendar, Folder, Cloud } from "lucide-react";
import GlassIcons from "./GlassIcons";
import ScrambledText from "./ScrambledText";
import { useNavigate } from "react-router-dom";

export default function AppFeatureIcons({ username }) {
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
            label: <ScrambledText>Files</ScrambledText>,
            onClick: () => navigate(`/filestorage?username=${username}`)
        },
        {
            icon: <Cloud />,
            color: "deep_teal",
            label: <ScrambledText>Wetter</ScrambledText>
        }
    ];
    return <GlassIcons items={items} />;
}
