namespace KTH.API.Messages;

public class EmptyMessage(MessageId id) : IMessage
{
    public MessageId Id { get; } = id;

    public int Size => 0;

    public void Serialize(Span<byte> buffer)
    {
    }
}