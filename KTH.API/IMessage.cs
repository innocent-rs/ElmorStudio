namespace KTH.API;

public interface IMessage
{
    public int Size { get; }
    public MessageId Id { get; }
    public void Serialize(Span<byte> buffer);
}