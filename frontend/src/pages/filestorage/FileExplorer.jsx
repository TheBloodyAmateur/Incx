import React from 'react';
import './FileExplorer.css';

export default function FileExplorer({ contents, currentPath, bucketName, onNavigate, onRefresh }) {
    const handleDownload = async (fileName) => {
        console.log(`Download file: ${fileName}`);
    };

    const handleDeleteFile = async (fileName) => {
        console.log(`Delete file: ${fileName}`);
        onRefresh();
    };

    const handleDeleteDirectory = async (directoryName) => {
        console.log(`Delete directory: ${directoryName}`);
        onRefresh();
    };

    console.log('Rendering FileExplorer with contents:', contents);

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
            {contents && contents.length > 0 ? (
                <ul className="file-list">
                    {contents.map((item, index) => (
                        <li key={`${item.name}-${index}`} className={item.type === 'FILE' ? 'file' : 'directory'}>
                            <span className="file-name">{item.name}</span>
                            <span>{item.type}</span>
                            <span>{item.size ? `${(item.size / 1024).toFixed(2)} KB` : '-'}</span>
                            <span className="file-actions">
                                <button onClick={(e) => {
                                    e.stopPropagation();
                                    item.type === 'FOLDER' ? handleDeleteDirectory(item.name) : handleDeleteFile(item.name);
                                }}>
                                    Delete
                                </button>
                            </span>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="no-contents">
                    <p>No files or directories found.</p>
                </div>
            )}
        </div>
    );
}
