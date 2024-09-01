namespace KTH.API;

public enum MessageId : byte
{
    Welcome = 0x0,
    DeviceId = 0x1,
    UniqueId = 0x2,
    FirmwareVersion = 0x3,

    ReadTc1 = 0x10,
    ReadTc2 = 0x11,
    ReadVdd = 0x12,
    ReadTh1 = 0x14,
    ReadTh2 = 0x15,

    ReadAutoOff = 0x20,
    ReadUnit = 0x21,
    ReadSpeed = 0x22,
    ReadCalProfile = 0x23,
    ReadCalTc1 = 0x24,
    ReadCalTc2 = 0x25,

    WriteAutoOff = 0x30,
    WriteUnit = 0x31,
    WriteSpeed = 0x32,
    WriteCalProfile = 0x33,
    WriteCalTc1 = 0x34,
    WriteCalTc2 = 0x35,
    
    DisplayUpdateOff = 0x40,
    DisplayUpdateOn = 0x41,
    StartOffsetCal = 0x43,
    StoreConfiguration = 0x44,
    
    ResetDevice = 0xFD,
    EnterBootloader = 0xFE,
    Nop = 0xFF,
}