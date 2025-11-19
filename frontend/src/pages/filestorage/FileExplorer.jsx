import React from 'react';
import './FileExplorer.css';

export default function FileExplorer({ contents, currentPath, bucketName, onNavigate, onRefresh }) {
    // TODO: Implement file download
    const handleDownload = async (fileName) => {
        console.log(`Download file: ${fileName}`);
    };

    // TODO: Implement file deletion
    const handleDeleteFile = async (fileName) => {
        console.log(`Delete file: ${fileName}`);
        onRefresh();
    };

    // TODO: Implement directory deletion
    const handleDeleteDirectory = async (directoryName) => {
        console.log(`Delete directory: ${directoryName}`);
        onRefresh();
    };

    return (
        <div className="file-explorer-content">
            <div className="path-navigation">
                <button onClick={() => onNavigate([])}>Root</button>
                {currentPath.map((dir, index) => (
                    <React.Fragment key={index}>
                        <span>/</span>
                        <button onClick={() => onNavigate(currentPath.slice(0, index + 1))}>{dir}</button>
                    </React.Fragment>
                ))}
            </div>
            <div className="file-list-header">
                <span>Name</span>
                <span>Type</span>
                <span>Size</span>
                <span>Actions</span>
            </div>
            <ul className="file-list">
                {contents.map(item => (
                    <li key={item.name} className={item.type === 'FOLDER' ? 'directory' : 'file'}>
                        <span
                            className="file-name"
                            onClick={() => {
                                if (item.type === 'FOLDER') {
                                    onNavigate([...currentPath, item.name]);
                                } else {
                                    handleDownload(item.name);
                                }
                            }}
                        >
                            {item.name}
                        </span>
                        <span>{item.type}</span>
                        <span>{item.size ? `${(item.size / 1024).toFixed(2)} KB` : '-'}</span>
                        <span className="file-actions">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    item.type === 'FOLDER'
                                        ? handleDeleteDirectory(item.name)
                                        : handleDeleteFile(item.name);
                                }}
                            >
                                Delete
                            </button>
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}