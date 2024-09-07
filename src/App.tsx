import React, {useEffect, useState} from "react";
import {invoke} from "@tauri-apps/api/core";
import "./App.css";
import {DndProvider, useDrag, useDrop} from "react-dnd";
import {HTML5Backend} from "react-dnd-html5-backend";

interface Device {
    id: number;
    kind: string;
    port: String;
    is_open: boolean;
    firmware: number;
    folder?: string; // Folder name (optional)
}

function Devices() {
    const [devices, setDevices] = useState<Device[]>([]);
    const [groupNames, setGroupNames] = useState<{ [key: string]: string }>({}); // Store custom group names
    const [editingGroup, setEditingGroup] = useState<string | null>(null); // Track which group is being renamed
    const [newGroupName, setNewGroupName] = useState<string>(""); // Track new group name input
    const [groupRates, setGroupRates] = useState<{
        [key: string]: { pullRate: number; writeRate: number };
    }>({});

    useEffect(() => {
        // Define an async function inside useEffect
        const fetchDevices = async () => {
            try {
                // Await the result of the invoke call
                const result = await invoke<Device[]>('get_devices');
                setDevices(result); // Update the state with the fetched devices
                console.log(result);
            } catch (error) {
                console.error('Error fetching devices:', error);
            }
        };

        fetchDevices(); // Call the async function
    }, []); // The empty array ensures the effect runs only once, when the component mounts

    const handleDrop = (draggedDevice: Device, targetDevice: Device) => {
        if (draggedDevice.id === targetDevice.id) return; // Don't drop onto the same card
        setDevices((prevDevices) => {
            const folder = targetDevice.folder || `Group ${targetDevice.id}`; // Assign a folder name if it doesn't exist
            return prevDevices.map((device) =>
                device.id === draggedDevice.id
                    ? {...device, folder} // Add dragged device to folder
                    : device.id === targetDevice.id
                        ? {...device, folder} // Also assign folder to target device
                        : device
            );
        });
    };

    const groupedDevices = devices.reduce((acc, device) => {
        const folder = device.folder || 'Ungrouped';
        if (!acc[folder]) acc[folder] = [];
        acc[folder].push(device);
        return acc;
    }, {} as Record<string, Device[]>);

    const handleRemoveFromGroup = (deviceId: number) => {
        setDevices((prevDevices) =>
            prevDevices.map((device) =>
                device.id === deviceId
                    ? {...device, folder: undefined} // Remove device from group
                    : device
            )
        );
    };

    const handleRenameGroup = (folder: string) => {
        setEditingGroup(folder); // Set the group being renamed
        setNewGroupName(groupNames[folder] || folder); // Prefill the input with the current group name
    };

    const handleGroupNameChange = () => {
        if (!newGroupName.trim()) return; // Don't allow empty group names
        setGroupNames((prevNames) => ({
            ...prevNames,
            [editingGroup!]: newGroupName.trim(),
        }));
        setEditingGroup(null); // Reset the renaming state
    };

    const handleRateChange = (folder: string, type: "pullRate" | "writeRate", value: number) => {
        setGroupRates((prevRates) => ({
            ...prevRates,
            [folder]: {
                ...prevRates[folder],
                [type]: value,
            },
        }));
    };

    /*    return (
            <div className="container mx-auto p-4">
                {Object.entries(groupedDevices).map(([folderName, folderDevices]) => (
                    <div key={folderName} className="mb-8">
                        <h2 className="text-3xl font-bold mb-4 text-gray-100">{folderName}</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                            {folderDevices.map((device) => (
                                <DeviceCard key={device.id} device={device} onDrop={handleDrop} onRemoveFromGroup={handleRemoveFromGroup}/>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );*/
    const handleDeleteGroup = (folder: string) => {
        setDevices((prevDevices) =>
            prevDevices.map((device) =>
                device.folder === folder ? {...device, folder: undefined} : device
            )
        );
        setGroupNames((prevNames) => {
            const updatedNames = {...prevNames};
            delete updatedNames[folder]; // Remove the custom name for the deleted group
            return updatedNames;
        });
    };
    return (
        <div className="container mx-auto p-4">
            {Object.entries(groupedDevices).map(([folderName, folderDevices]) => {
                const displayFolderName = groupNames[folderName] || folderName;

                return (
                    <div key={folderName} className="mb-8">
                        <div className="flex items-center justify-between">
                            {editingGroup === folderName ? (
                                <div className="flex">
                                    <input
                                        type="text"
                                        value={newGroupName}
                                        onChange={(e) => setNewGroupName(e.target.value)}
                                        className="p-2 bg-gray-700 text-white rounded"
                                    />
                                    <button
                                        onClick={handleGroupNameChange}
                                        className="ml-2 px-4 py-2 bg-blue-600 text-white rounded"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={() => setEditingGroup(null)}
                                        className="ml-2 px-4 py-2 bg-red-600 text-white rounded"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <h2 className="text-3xl font-bold mb-4 text-gray-100">{displayFolderName}</h2>
                            )}

                            {!editingGroup && folderName !== "Ungrouped" && (
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleRenameGroup(folderName)}
                                        className="px-4 py-2 bg-gray-600 text-white rounded"
                                    >
                                        Rename Group
                                    </button>
                                    <button
                                        onClick={() => handleDeleteGroup(folderName)}
                                        className="px-4 py-2 bg-red-600 text-white rounded"
                                    >
                                        Delete Group
                                    </button>
                                </div>
                            )}
                        </div>

                        {folderName !== "Ungrouped" && (
                            <div className="flex space-x-4 mt-2">
                                <div>
                                    <label className="block text-gray-400">Pull Rate:</label>
                                    <input
                                        type="number"
                                        value={groupRates[folderName]?.pullRate || 0}
                                        onChange={(e) => handleRateChange(folderName, "pullRate", Number(e.target.value))}
                                        className="p-2 bg-gray-700 text-white rounded"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-400">Write Rate:</label>
                                    <input
                                        type="number"
                                        value={groupRates[folderName]?.writeRate || 0}
                                        onChange={(e) => handleRateChange(folderName, "writeRate", Number(e.target.value))}
                                        className="p-2 bg-gray-700 text-white rounded"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                            {folderDevices.map((device) => (
                                <DeviceCard
                                    key={device.id}
                                    device={device}
                                    onDrop={handleDrop}
                                    onRemoveFromGroup={handleRemoveFromGroup}
                                />
                            ))}
                        </div>
                    </div>
                )
                    ;
            })}
        </div>
    );
}

const ItemTypes = {
    DEVICE: 'device',
};

function DeviceCard({device, onDrop, onRemoveFromGroup}: {
    device: Device;
    onDrop: (dragged: Device, target: Device) => void;
    onRemoveFromGroup: (deviceId: number) => void
}) {
    // Drag functionality
    const [{isDragging}, drag] = useDrag(() => ({
        type: ItemTypes.DEVICE,
        item: device,
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }));

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
            {device.folder && (
                <button
                    className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500"
                    onClick={() => onRemoveFromGroup(device.id)}
                >
                    Remove from Group
                </button>
            )}
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
