namespace KTH.API;

public interface IKth : IDisposable
{
    public string ReadWelcome();
    public ushort ReadDeviceId();
    public UniqueId ReadUniqueId();
    public ushort ReadFirmwareVersion();
    
    public short ReadTc1();
    public short ReadTc2();
    public int ReadVdd();
    public ushort ReadTh1();
    public ushort ReadTh2();
    
    public byte ReadAutoOff();
    public Unit ReadUnit();
    public Speed ReadSpeed();
    public CalibrationProfile ReadCalibrationProfile();
    public CalibrationValue ReadCalibrationTc1();
    public CalibrationValue ReadCalibrationTc2();
    public void WriteAutoOff(byte value);
    public void WriteUnit(Unit unit);
    public void Nop();
}