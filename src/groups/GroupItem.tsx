import {Group} from "../model.ts";
import {useState} from "react";
import {invoke} from "@tauri-apps/api/core";
import EditableText from "../forms/EditableText.tsx";
import {LockClosedIcon, LockOpenIcon, TrashIcon} from "@heroicons/react/24/solid";

const GroupItem = ({group, onSave, handleRemoveGroup}: {
    group: Group;
    onSave(groups: Group[]): void;
    handleRemoveGroup(groupId: number): Promise<void>;
}) => {
    const [isProcessing, _] = useState(false);
    const toggleLock = async (group: Group) => {
        const updatedGroups = await invoke<Group[]>('group_lock_unlock', {
            groupId: group.id,
            lock: !group.is_locked, // Toggle current lock state
        });
        onSave(updatedGroups);
    };

    const handleSave = async (newText: string) => {
        let groups = await invoke<Group[]>('group_rename', {groupId: group.id, newName: newText});
        onSave(groups);
    };

    return (
        <div
            className={`flex items-center justify-between w-full transition-opacity duration-300`} // Apply the animation class based on "isRemoving"
        >
            <div className="flex items-center justify-between w-full">
                <EditableText initialValue={group.name} onSave={handleSave} canEdit={!group.is_locked} />
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
                        onClick={() => !group.is_locked && handleRemoveGroup(group.id)}
                    />
                </div>
            </div>
        </div>
    );
};

export default GroupItem;