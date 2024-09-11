﻿import {useEffect, useState} from "react";
import {Group, ItemTypes} from "./model.ts";
import {invoke} from "@tauri-apps/api/core";
import {useDrop} from "react-dnd";
import GroupItem from "./groups/GroupItem.tsx";
import DeviceCard from "./DeviceCard.tsx";
import clsx from "clsx";

function GroupDropZone({group, onDropDevice, children}) {
    const [{isOver, canDrop}, drop] = useDrop({
        accept: ItemTypes.DEVICE,
        canDrop: (draggedItem: { deviceId: number; sourceGroupId: number }) => {
            // Prevent dropping if the group is locked or it's the same group
            return !group.is_locked && draggedItem.sourceGroupId !== group.id;
        },
        drop: (draggedItem: { deviceId: number; sourceGroupId: number }) => {
            const {deviceId, sourceGroupId} = draggedItem;
            const targetGroupId = group.id; // Get the target group ID

            // Pass all the required data (source group, target group, device ID)
            onDropDevice({deviceId, sourceGroupId, targetGroupId});
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        })
    });

    return (
        <div ref={drop} className={clsx(
            'mb-12 bg-gray-700 p-6 rounded-lg shadow-lg border',
            {
                'border-green-500': isOver && canDrop,
                'border-red-500': isOver && !canDrop,
            }
        )}>
            {children}
        </div>
    );
}

function DeviceList() {
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

    const handleDropDevice = async ({deviceId, sourceGroupId, targetGroupId}) => {
        if (sourceGroupId === targetGroupId) return; // Prevent moving to the same group

        try {
            const result = await invoke<Group[]>(
                'group_move_device_to',
                {deviceId, sourceGroupId, targetGroupId}
            );
            setGroups(result); // Update the group list after the device is moved
        } catch (error) {
            console.error('Error moving device:', error);
        }
    };

    const onAddGroup = async () => {
        let groups = await invoke<Group[]>('group_create');

        setGroups(groups);
    };
    const handleRemoveGroup = async (groupId: number) => {
        const updatedGroups = await invoke<Group[]>('group_delete', {groupId});
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
                    <GroupDropZone key={group.id} group={group} onDropDevice={handleDropDevice}>
                        <div
                            className={`flex items-center justify-between mb-4 border-b border-gray-600 pb-2 transition-all duration-300`}>
                            <GroupItem group={group} onSave={setGroups} handleRemoveGroup={handleRemoveGroup}/>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                            {group.devices.map((device) => (
                                <DeviceCard key={device.id} device={device} group={group}/>
                            ))}
                        </div>
                    </GroupDropZone>
                );
            })}
        </div>
    );
}

export default DeviceList;