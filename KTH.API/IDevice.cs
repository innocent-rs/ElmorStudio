namespace KTH.API;

public interface IDevice : IDisposable
{
    void Write(byte[] buffer, int offset, int count);
    int Read(byte[] buffer, int offset, int count);
}