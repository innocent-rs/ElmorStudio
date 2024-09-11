import React, {useEffect, useRef, useState} from "react";
import {invoke} from "@tauri-apps/api/core";
import "./App.css";
import {DndProvider, useDrag, useDrop} from "react-dnd";
import {HTML5Backend} from "react-dnd-html5-backend";
import {LockClosedIcon, LockOpenIcon, PencilIcon, TrashIcon} from '@heroicons/react/24/solid';

interface Group {
    id: number;
    name: string;
    devices: Device[];
    is_locked: boolean;
}

interface Device {
    id: number;
    kind: string;
    port: String;
    is_open: boolean;
    firmware: number;
    isLocked: boolean;
    //folder?: string; // Folder name (optional)
}

const LockButton = ({isLocked, onToggleLock}) => {
    return (
        <button onClick={onToggleLock}>
            {isLocked ? (
                <LockClosedIcon className={`h-24 w-24 text-gray-700`}/>
            ) : (
                <LockOpenIcon className={`h-24 w-24 text-gray-700`}/>
            )}
        </button>
    );
};

const EditableText = ({group, onSave}: {
    group: Group;
    onSave(groups: Group[]): void;
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [newText, setNewText] = useState(group.name);
    const [isProcessing, _] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const toggleLock = async (group: Group) => {
        const updatedGroups = await invoke<Group[]>('group_lock_unlock', {
            groupId: group.id,
            lock: !group.is_locked, // Toggle current lock state
        });
        onSave(updatedGroups);
    };

    const handleSave = async () => {
        if (!newText.trim()) return; // Don't allow empty group names
        let groups = await invoke<Group[]>('group_rename', {groupId: group.id, newName: newText});
        onSave(groups);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setNewText(group.name);
        setIsEditing(false);
    };

    const handlePencilClick = () => {
        setIsEditing(true);
        setTimeout(() => {
            inputRef.current && inputRef.current.focus(); // Step 2: Focus on the input when editing starts
        }, 0); // Timeout ensures React has updated the DOM before focusing
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSave(); // Call save when Enter is pressed
        }
        else if (e.key === 'Escape') {
            handleCancel();
        }
    };

    return (
        <div className="flex items-center justify-between w-full">
            {isEditing ? (
                <div className="flex items-center space-x-2 w-full">
                    <input
                        ref={inputRef} // Step 3: Attach the ref to the input
                        type="text"
                        value={newText}
                        onChange={(e) => setNewText(e.target.value)}
                        onKeyDown={handleKeyDown} // Handle key press
                        className="flex-1 p-2 bg-gray-800 text-white rounded outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                    <button
                        onClick={handleSave}
                        disabled={newText === group.name}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-all disabled:bg-gray-600"
                    >
                        Save
                    </button>
                    <button
                        onClick={handleCancel}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-all"
                    >
                        Cancel
                    </button>
                </div>
            ) : (
                <div className="flex items-center justify-between w-full">
                    {/* Left aligned text */}
                    <div className="flex items-center space-x-2">
                        <h2 className="text-2xl font-bold text-white truncate">
                            {group.name}
                        </h2>
                        <PencilIcon
                            className={`w-5 h-5 ${!group.is_locked ? 'text-gray-400 cursor-pointer hover:text-gray-200' : 'text-gray-600'}`}
                            onClick={handlePencilClick}
                        />
                    </div>

                    {/* Right aligned icons */}
                    <div className="flex items-center space-x-3">
                        {group.is_locked ? (
                            <LockClosedIcon
                                className="w-5 h-5 text-gray-600 cursor-pointer"
                                onClick={() => !isProcessing && toggleLock(group)}
                            />
                        ) : (
                            <LockOpenIcon
                                className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-200"
                                onClick={() => !isProcessing && toggleLock(group)}
                            />
                        )}

                        <TrashIcon
                            className={`w-5 h-5 ${!group.is_locked ? 'text-gray-400 cursor-pointer hover:text-gray-200' : 'text-gray-600'}`}
                            onClick={() => !group.is_locked && invoke('group_delete', { groupId: group.id })}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

function Devices() {
    const [groups, setGroups] = useState<Group[]>([]);

    useEffect(() => {
        // Define an async function inside useEffect
        const fetchDevices = async () => {
            try {
                // Await the result of the invoke call
                const result = await invoke<Group[]>('groups_fetch');
                setGroups(result); // Update the state with the fetched devices
                console.log(result);
            } catch (error) {
                console.error('Error fetching devices:', error);
            }
        };

        fetchDevices(); // Call the async function
    }, []); // The empty array ensures the effect runs only once, when the component mounts

    const handleDrop = async (draggedDevice: Device, targetDevice: Device) => {
        if (draggedDevice.id === targetDevice.id) return; // Don't drop onto the same card
        const result = await invoke<Group[]>('merge_devices', {'dId1': draggedDevice.id, 'dId2': targetDevice.id});
        setGroups(result)
    };

    const handleRemoveGroup = async (groupId: number) => {
        const updatedGroups: Group[] = await invoke('group_remove', {groupId: groupId});
        setGroups(updatedGroups); // Update the local state with the updated groups
        console.log(updatedGroups);
    };

    const handleGroupNameChange = async (groupId: number, newName: string) => {
        if (!newName.trim()) return; // Don't allow empty group names
        let groups = await invoke<Group[]>('group_rename', {groupId, newName});
        setGroups(groups);
    };

    const onAddGroup = async () => {
        let groups = await invoke<Group[]>('group_create');

        setGroups(groups);
    };

    const toggleLock = async (group: Group) => {
        const updatedGroups = await invoke<Group[]>('group_lock_unlock', {
            groupId: group.id,
            lock: !group.is_locked, // Toggle current lock state
        });
        setGroups(updatedGroups);
    };

    return (
        <div className="container mx-auto p-4 bg-gray-800 rounded-lg">
            <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-8 w-full text-center"
                onClick={onAddGroup}
            >
                Create a new group
            </button>
            {groups.map((group: Group) => {
                return (
                    <div key={group.id} className="mb-12 bg-gray-700 p-6 rounded-lg shadow-lg">
                        <div className="flex items-center justify-between mb-4 border-b border-gray-600 pb-2">
                            {/* EditableText component */}
                            <EditableText group={group} onSave={setGroups}/>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                            {group.devices.map((device) => (
                                /*                                <DeviceCard
                                                                    key={device.id}
                                                                    device={device}
                                                                    onDrop={handleDrop}
                                                                    group={group}
                                                                    /!*onRemoveFromGroup={handleRemoveFromGroup}*!/
                                                                />*/
                                <div></div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

const ItemTypes = {
    DEVICE: 'device',
};

function DeviceCard({device, onDrop, group, onRemoveFromGroup}: {
    device: Device;
    onDrop: (dragged: Device, target: Device) => void;
    group: Group;
    onRemoveFromGroup: (deviceId: number) => void
}) {
    // Drag functionality
    const [{isDragging}, drag] = useDrag(() => ({
        type: ItemTypes.DEVICE,
        canDrag: () => !group.is_locked,
        item: device,
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }), [group]);

    // Drop functionality
    const [{isOver, canDrop}, drop] = useDrop(() => ({
        accept: ItemTypes.DEVICE,
        /*        canDrop: (d) => {
                    return d.folder === 'Ungrouped' || d.folder !== device.folder;
                },*/
        drop: (draggedDevice: Device) => {
            onDrop(draggedDevice, device); // Call drop handler
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(), // Tracks if an item is currently being hovered over
            canDrop: monitor.canDrop(), // Tracks if the drop can happen
        }),
    }));

    // Visual feedback for drop target
    const isActive = canDrop && isOver;
    let borderColor = 'border-gray-700';
    if (isActive) {
        borderColor = 'border-green-500'; // When a valid device is dragged over
    } else if (canDrop) {
        borderColor = 'border-blue-500'; // When a device can be dropped, but not hovering yet
    }

    return (
        <div
            ref={(node) => drag(drop(node))} // Combine drag and drop refs
            className={`bg-gray-800 rounded-xl shadow-lg p-6 border hover:border-blue-500 transition duration-300 transform hover:scale-105 ${
                isDragging ? 'opacity-50' : ''
            } ${borderColor}`} // Change border based on state
        >
            <h2 className="text-2xl font-semibold mb-2 text-white">{device.kind}</h2>
            <p className="text-gray-400 mb-4">
                Port: {device.port} <br/>
                Firmware version: 0x{device.firmware}
            </p>
            {/*            {device.folder && (
                <button
                    className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500"
                    onClick={() => onRemoveFromGroup(device.id)}
                >
                    Remove from Group
                </button>
            )}*/}
        </div>
    );
}

function Tabs() {
    const [activeTab, setActiveTab] = useState(0);

    const tabs = ['Devices'];
    const content = [
        <Devices/>,
    ];

    return (
        <div className="w-full mx-auto mt-8">
            <div className="flex space-x-2">
                {tabs.map((tab, index) => (
                    <button
                        key={index}
                        className={`px-4 py-2 font-semibold rounded-t-lg ${
                            activeTab === index
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                        onClick={() => setActiveTab(index)}
                    >
                        {tab}
                    </button>
                ))}
            </div>
            <div className="p-4 bg-gray-800 rounded-b-lg">
                <p>{content[activeTab]}</p>
            </div>
        </div>
    );
}

function App() {
    return (
        <DndProvider backend={HTML5Backend}>
            <div className="bg-gray-900 text-white min-h-screen flex">
                <Tabs/>
            </div>
        </DndProvider>
    );
}

export default App;
