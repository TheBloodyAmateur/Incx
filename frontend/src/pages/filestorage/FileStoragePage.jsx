import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Aurora from "../../components/aurora/Aurora";
import FileExplorer from './FileExplorer';
import UploadModal from './UploadModal';
import CreateDirectoryModal from './CreateDirectoryModal';
import "./FileStoragePage.css";

export default function FileStoragePage() {
    const [searchParams] = useSearchParams();
    const username = searchParams.get('username');
    const [currentPath, setCurrentPath] = useState([]);
    const [currentContents, setCurrentContents] = useState([]);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showCreateDirModal, setShowCreateDirModal] = useState(false);

    const fetchBucketContents = async (path = []) => {
        // Replace with actual API call
        const mockContents = [
            { name: "Documents", type: "FOLDER", size: null },
            { name: "image.jpg", type: "FILE", size: 102400 }
        ];
        setCurrentPath(path);
        setCurrentContents(mockContents);
    };

    useEffect(() => {
        if (username) {
            fetchBucketContents([]);
        }
    }, [username]);

    if (!username) {
        return (
            <div className="filestorage-wrapper">
                <Aurora colorStops={["#1A1A1A", "#46338A", "#0F6A77"]} blend={0.55} amplitude={1.0} speed={0.35} />
                <div className="filestorage-content">
                    <p>No user logged in.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="filestorage-wrapper">
            <Aurora colorStops={["#1A1A1A", "#46338A", "#0F6A77"]} blend={0.55} amplitude={1.0} speed={0.35} />
            <div className="filestorage-content">
                <div className="filestorage-header">
                    <h1>File Storage: {username}</h1>
                    <div className="filestorage-actions">
                        <button onClick={() => setShowUploadModal(true)}>Upload File</button>
                        <button onClick={() => setShowCreateDirModal(true)}>Create Directory</button>
                    </div>
                </div>
                <div className="file-explorer">
                    <FileExplorer
                        contents={currentContents}
                        currentPath={currentPath}
                        bucketName={username}
                        onNavigate={fetchBucketContents}
                        onRefresh={() => fetchBucketContents(currentPath)}
                    />
                </div>
                {showUploadModal && (
                    <UploadModal
                        bucketName={username}
                        currentPath={currentPath}
                        onClose={() => setShowUploadModal(false)}
                        onUploadSuccess={() => fetchBucketContents(currentPath)}
                    />
                )}
                {showCreateDirModal && (
                    <CreateDirectoryModal
                        bucketName={username}
                        currentPath={currentPath}
                        onClose={() => setShowCreateDirModal(false)}
                        onDirectoryCreated={() => fetchBucketContents(currentPath)}
                    />
                )}
            </div>
        </div>
    );
}
