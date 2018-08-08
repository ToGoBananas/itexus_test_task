import React from 'react';
import PropTypes from 'prop-types';

import {default as ReactDropzone} from 'react-dropzone';
import {autorun} from 'mobx';

import AutoObservable from './AutoObservable';


class Dropzone extends React.Component {
    socketObservable;

    constructor(props) {
        super(props);
        this.state = {
            dropzoneActive: false,
            files: [],
            words: {},
            ...props
        };
    }

    callApi(message) {
        let socket;
        const openStream = () => {
            socket = new WebSocket("ws://0.0.0.0:8000/api");
            socket.onopen = () => {
                socket.send(message);
            };
            socket.onmessage = (message) => { this.socketObservable.data = message.data; };
        };
        const closeStream = () => { socket.close() };
        this.socketObservable = new AutoObservable(openStream, closeStream);
    }

    onDragEnter() {
        this.setState({
            dropzoneActive: true
        });
    }

    onDragLeave() {
        this.setState({
            dropzoneActive: false
        });
    }

    onDrop(acceptedFiles, rejectedFiles) {
        if (rejectedFiles.length > 0) {
            alert('Wrong file type. (Only .txt)');
        }
        else if (acceptedFiles > 1) {
            alert('Too many files selected.');
        }
        else {
            const reader = new FileReader();
            reader.readAsBinaryString(acceptedFiles[0]);
            reader.onloadend = () => {
                this.callApi(reader.result);
                const disposer = autorun(() => {
                    const response = this.socketObservable.data;
                    if (response) {
                        this.setState({
                            words: JSON.parse(response)
                        });
                        disposer();
                    }
                }); 

                this.setState({
                    files: acceptedFiles,
                    dropzoneActive: false
                });
            }
        }
    }

    render() {
        const { accept, files, dropzoneActive, words } = this.state;
        const overlayStyle = {
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            padding: '2.5em 0',
            background: 'rgba(0,0,0,0.5)',
            textAlign: 'center',
            color: '#fff'
        };
        return (
            <ReactDropzone
                disableClick
                style={{position: "relative"}}
                accept={accept}
                onDrop={this.onDrop.bind(this)}
                onDragEnter={this.onDragEnter.bind(this)}
                onDragLeave={this.onDragLeave.bind(this)}
            >
                { dropzoneActive && <div style={overlayStyle}>Drop files...</div> }
                <div>
                    <h1>Drop files here...</h1>
                    <h2>Dropped file</h2>
                    <ul>
                        {
                            files.map(f => <li key={f.name}>{f.name} - {f.size} bytes</li>)
                        }
                    </ul>
                    <h2>Results:</h2>
                    <ul>
                        {
                            Object.keys(words).map((key, index) => <li key={key}>{key} -> {words[key]}</li>)
                        }
                    </ul>
                </div>
            </ReactDropzone>
        );
    }
}

Dropzone.propTypes = {
    accept: PropTypes.array,
};

Dropzone.defaultProps = {
    accept: ['text/plain', ],
};

export default Dropzone;