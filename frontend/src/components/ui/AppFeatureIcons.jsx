import { Calendar, Folder, Cloud } from "lucide-react";
import GlassIcons from "./GlassIcons";
import ScrambledText from "./ScrambledText";

export default function AppFeatureIcons() {
    const items = [
        {
            icon: <Calendar />,
            color: "purple",
            label: <ScrambledText>Kalender</ScrambledText>
        },
        {
            icon: <Folder />,
            color: "blue",
            label: <ScrambledText>Files</ScrambledText>
        },
        {
            icon: <Cloud />,
            color: "indigo",
            label: <ScrambledText>Wetter</ScrambledText>
        }
    ];

    return <GlassIcons items={items} />;
}
