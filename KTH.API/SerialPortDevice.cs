using System.IO.Ports;

namespace KTH.API;

class SerialPortDevice(SerialPort serialPort) : IDevice
{
    public void Write(byte[] buffer, int offset, int count) => serialPort.Write(buffer, offset, count);
    public int Read(byte[] buffer, int offset, int count) => serialPort.Read(buffer, offset, count);
    public void Dispose()
    {
        serialPort.Dispose();
    }
}