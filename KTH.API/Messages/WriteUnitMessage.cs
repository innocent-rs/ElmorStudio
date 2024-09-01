namespace KTH.API.Messages;

public record WriteUnitMessage(Unit Value) : IMessage
{
    public int Size => 1;
    public MessageId Id => MessageId.WriteUnit;
    public void Serialize(Span<byte> buffer)
    {
        buffer[0] = (byte)Value;
    }
}