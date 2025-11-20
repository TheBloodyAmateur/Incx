import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Aurora from "../../components/aurora/Aurora";
import FileExplorer from './FileExplorer';
import "./FileStoragePage.css";

export default function FileStoragePage() {
    const [searchParams] = useSearchParams();
    const username = searchParams.get('username');
    const [currentPath, setCurrentPath] = useState([]);
    const [currentContents, setCurrentContents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchBucketContents = async (path = []) => {
        if (!username) return;

        try {
            setLoading(true);
            setError(null);
            const pathString = path.join('/');
            console.log(`Fetching contents for bucket: ${username}, path: ${pathString}`);

            const response = await fetch(`http://localhost:8080/api/files/content?bucketName=${username}&path=${pathString}`);

            if (!response.ok) {
                throw new Error(`Failed to fetch contents: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Fetched data:', data);
            setCurrentPath(path);
            setCurrentContents(data);
        } catch (error) {
            console.error("Error fetching bucket contents:", error);
            setError(error.message);
            setCurrentContents([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        console.log('Username:', username);
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
                </div>
                <div className="file-explorer">
                    {loading && <p>Loading...</p>}
                    {error && <p className="error-message">{error}</p>}
                    <FileExplorer
                        contents={currentContents}
                        currentPath={currentPath}
                        bucketName={username}
                        onNavigate={fetchBucketContents}
                        onRefresh={() => fetchBucketContents(currentPath)}
                    />
                </div>
            </div>
        </div>
    );
}
