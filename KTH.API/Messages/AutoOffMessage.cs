namespace KTH.API.Messages;

public record AutoOffMessage(byte Value) : IMessage
{
    public int Size => 1;
    public MessageId Id => MessageId.WriteAutoOff;
    public void Serialize(Span<byte> buffer)
    {
        buffer[0] = Value;
    }
}