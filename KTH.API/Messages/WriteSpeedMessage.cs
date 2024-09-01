namespace KTH.API.Messages;

public record WriteSpeedMessage(byte Value) : IMessage
{
    public int Size => 1;
    public MessageId Id => MessageId.WriteSpeed;
    public void Serialize(Span<byte> buffer)
    {
        buffer[0] = Value;
    }
}