namespace KTH.API;

public class UniqueId(ReadOnlyMemory<byte> value)
{
    private ReadOnlyMemory<byte> Value => value;
    
    public override bool Equals(object? obj)
    {
        if (obj is UniqueId other)
        {
            // Compare byte arrays for content equality
            return Value.Span.SequenceEqual(other.Value.Span);
        }

        return false;
    }
    public override int GetHashCode()
    {
        // Use a hash code calculation that considers the contents of the byte array
        var hash = 17;
        foreach (var b in Value.Span)
        {
            hash = hash * 31 + b;
        }
        return hash;
    }
    
    public override string ToString()
    {
        return BitConverter.ToString(Value.ToArray()).Replace("-", "");
    }
}