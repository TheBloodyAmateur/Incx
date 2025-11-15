import { Calendar, Folder, Cloud } from "lucide-react";
import GlassIcons from "./GlassIcons";
import ScrambledText from "./ScrambledText";

export default function AppFeatureIcons() {
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
            label: <ScrambledText>Wetter</ScrambledText>
        }
    ];

    return <GlassIcons items={items} />;
}
