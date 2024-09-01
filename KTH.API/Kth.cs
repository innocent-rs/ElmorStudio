using System.Buffers.Binary;
using System.Text;
using KTH.API.Messages;

namespace KTH.API;

internal class Kth(IDevice device) : IKth
{
    private readonly object _lock = new object();
    private delegate T ReadDelegate<T>(ReadOnlySpan<byte> buffer);
    private void Send(IMessage message)
    {
        var size = message.Size;
        var totalSize = size + 1;
        var buffer = new byte[totalSize];
        buffer[0] = (byte)message.Id;
        if (totalSize > 1)
        {
            message.Serialize(buffer.AsSpan()[1..]);
        }

        lock (_lock)
        {
            for (var i = 0; i < buffer.Length; i++)
            {
                device.Write(buffer, i, 1);
                Thread.Sleep(1);
            }
        }
    }
    private T SendAndRead<T>(IMessage message, int readSize, ReadDelegate<T> deserialize)
    {
        lock (_lock)
        {
            Send(message);

            // Read the response with 1ms delay between each byte read
            var readBuffer = new byte[readSize];
            var received = 0;

            while (received < readSize)
            {
                var bytesRead = device.Read(readBuffer, received, 1);
                if (bytesRead > 0)
                {
                    received += bytesRead;
                }

                Thread.Sleep(1);
            }

            return deserialize(readBuffer.AsSpan());
        }
    }
    private byte SendMessageAndByte(IMessage message) => SendAndRead(message, 1, b => b[0]);
    private ushort SendMessageAndUShort(IMessage message) => SendAndRead(message, 2, BinaryPrimitives.ReadUInt16LittleEndian);
    private short SendMessageAndShort(IMessage message) => SendAndRead(message, 2, BinaryPrimitives.ReadInt16LittleEndian);
    private int SendMessageAndInt(IMessage message) => SendAndRead(message, 4, BinaryPrimitives.ReadInt32LittleEndian);
    private void SendMessageAndCheckCompletion(IMessage message)
    {
        var isOk = SendAndRead(message, 1, buffer => buffer[0] == 0x01);
        if (!isOk)
        {
            throw new KthException("Kth message failed");
        }
    }
    
    public string ReadWelcome() => SendAndRead(new EmptyMessage(MessageId.Welcome), 18, Encoding.ASCII.GetString);
    public ushort ReadDeviceId() => SendMessageAndUShort(new EmptyMessage(MessageId.DeviceId));
    public UniqueId ReadUniqueId() => SendAndRead(new EmptyMessage(MessageId.UniqueId), 12, buffer => new UniqueId(buffer.ToArray()));//TODO: improve. it's garbage
    public ushort ReadFirmwareVersion() => SendMessageAndUShort(new EmptyMessage(MessageId.FirmwareVersion));
    public short ReadTc1() => SendMessageAndShort(new EmptyMessage(MessageId.ReadTc1));
    public short ReadTc2() => SendMessageAndShort(new EmptyMessage(MessageId.ReadTc2));
    public int ReadVdd() => SendMessageAndInt(new EmptyMessage(MessageId.ReadVdd));
    public ushort ReadTh1() => SendMessageAndUShort(new EmptyMessage(MessageId.ReadTh1));
    public ushort ReadTh2() => SendMessageAndUShort(new EmptyMessage(MessageId.ReadTh2));

    public byte ReadAutoOff() =>  SendMessageAndByte(new EmptyMessage(MessageId.ReadAutoOff));
    public Unit ReadUnit() => (Unit)SendMessageAndByte(new EmptyMessage(MessageId.ReadUnit));
    public Speed ReadSpeed() => (Speed)SendMessageAndByte(new EmptyMessage(MessageId.ReadSpeed));
    public CalibrationProfile ReadCalibrationProfile() => (CalibrationProfile)SendMessageAndByte(new EmptyMessage(MessageId.ReadCalProfile));
    private static CalibrationValue ReadCalibrationValue(ReadOnlySpan<byte> buffer)
    {
        var zero = BinaryPrimitives.ReadUInt16LittleEndian(buffer[0..2]);
        var gain = BinaryPrimitives.ReadUInt16LittleEndian(buffer[2..4]);
        var thOffset = BinaryPrimitives.ReadInt16LittleEndian(buffer[4..6]);

        return new CalibrationValue(zero, gain, thOffset);
    }
    public CalibrationValue ReadCalibrationTc1() => SendAndRead(new EmptyMessage(MessageId.ReadCalTc1), 6, ReadCalibrationValue);
    public CalibrationValue ReadCalibrationTc2() => SendAndRead(new EmptyMessage(MessageId.ReadCalTc2), 6, ReadCalibrationValue);

    public void WriteAutoOff(byte value) => Send(new AutoOffMessage(value));
    public void WriteUnit(Unit unit) => SendMessageAndCheckCompletion(new WriteUnitMessage(unit));
    public void WriteSpeed(byte value) => SendMessageAndCheckCompletion(new WriteSpeedMessage(value));
    public void WriteCalibrationProfile(CalibrationProfile calibrationProfile) => Send(new WriteCalibrationProfile(calibrationProfile));

    public void Nop() => Send(new EmptyMessage(MessageId.Nop));
    public void Dispose()
    {
        device.Dispose();
    }
}