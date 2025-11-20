import React, { useState } from 'react';
import './FileExplorer.css';

export default function FileExplorer({ contents, currentPath, bucketName, onNavigate, onRefresh }) {
    const [selectedFile, setSelectedFile] = useState(null);
    const [newDirectoryName, setNewDirectoryName] = useState('');

    const handleDownload = async (fileName) => {
        console.log(`Download file: ${fileName}`);
        try {
            const response = await fetch(`http://localhost:8080/api/files/download?fileName=${fileName}&bucketName=${bucketName}`, {
                method: 'GET',
            });

            if (!response.ok) {
                throw new Error(`Failed to download file: ${response.status} ${response.statusText}`);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } catch (error) {
            console.error("Error downloading file:", error);
        }
    };

    const handleDeleteFile = async (fileName) => {
        console.log(`Delete file: ${fileName}`);
        try {
            const response = await fetch(`http://localhost:8080/api/files/delete?fileName=${fileName}&bucketName=${bucketName}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error(`Failed to delete file: ${response.status} ${response.statusText}`);
            }

            onRefresh();
        } catch (error) {
            console.error("Error deleting file:", error);
        }
    };

    const handleDeleteDirectory = async (directoryName) => {
        console.log(`Delete directory: ${directoryName}`);
        try {
            const response = await fetch(`http://localhost:8080/api/files/directory?directoryName=${directoryName}&parentDirectory=${currentPath.join('/')}&bucketName=${bucketName}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error(`Failed to delete directory: ${response.status} ${response.statusText}`);
            }

            onRefresh();
        } catch (error) {
            console.error("Error deleting directory:", error);
        }
    };

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            alert('Please select a file to upload.');
            return;
        }
    
        const formData = new FormData();
        formData.append('fileData', selectedFile);
        formData.append('fileName', selectedFile.name);
        formData.append('bucketName', bucketName);
        formData.append('parentDirectory', currentPath.join('/'));
    
        try {
            const response = await fetch('http://localhost:8080/api/files/upload', {
                method: 'POST',
                body: formData,
            });
    
            if (!response.ok) {
                throw new Error(`Failed to upload file: ${response.status} ${response.statusText}`);
            }
    
            setSelectedFile(null);
            onRefresh();
        } catch (error) {
            console.error("Error uploading file:", error);
        }
    };    

    const handleCreateDirectory = async () => {
        if (!newDirectoryName) {
            alert('Please enter a directory name.');
            return;
        }

        try {
            const response = await fetch('http://localhost:8080/api/files/directory', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    directoryName: newDirectoryName,
                    parentDirectory: currentPath.join('/'),
                    bucketName: bucketName,
                }),
            });

            if (!response.ok) {
                throw new Error(`Failed to create directory: ${response.status} ${response.statusText}`);
            }

            setNewDirectoryName('');
            onRefresh();
        } catch (error) {
            console.error("Error creating directory:", error);
        }
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
            <div className="file-actions">
                <div className="file-upload">
                    <input type="file" onChange={handleFileChange} />
                    <button onClick={handleUpload}>Upload</button>
                </div>
                <div className="directory-create">
                    <input
                        type="text"
                        placeholder="New Directory Name"
                        value={newDirectoryName}
                        onChange={(e) => setNewDirectoryName(e.target.value)}
                    />
                    <button onClick={handleCreateDirectory}>Create Directory</button>
                </div>
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
            ) : (
                <div className="no-contents">
                    <p>No files or directories found.</p>
                </div>
            )}
        </div>
    );
}
