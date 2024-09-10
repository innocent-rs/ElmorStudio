mod groups;
mod devices;
mod state;

use std::sync::Mutex;
use serde::{Deserialize, Serialize};
use tauri::{Manager, State};
use crate::devices::{Device, DeviceKind};
use crate::groups::{group_create, group_lock_unlock, group_remove, group_remove_from, group_rename, groups_fetch, Group};
use crate::state::StudioState;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let group1 = Group::new(1, "Group 1".to_string(), vec![
                    Device::new(1, DeviceKind::KTHUsb, "COM3".to_string(), 0x5),
                    Device::new(2, DeviceKind::KTHUsb, "COM4".to_string(), 0x5),
                ],
                false,
            );
            let group2 = Group::new(0, "Ungrouped".to_string(), vec![
                    Device::new(3, DeviceKind::KTHUsb, "COM5".to_string(), 0x5)
                ],
                false
            );
            let state = StudioState {
                groups: vec![group1, group2]
            };
            
            app.manage(Mutex::new(state));
            Ok(())
        })
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![groups_fetch, group_create, group_lock_unlock, group_rename, group_remove, group_remove_from])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
