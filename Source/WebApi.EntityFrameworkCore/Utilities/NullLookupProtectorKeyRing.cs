namespace WebApi.EntityFrameworkCore.Utilities;

public class NullLookupProtectorKeyRing : ILookupProtectorKeyRing {
    public string CurrentKeyId => "static_key_id";
    public string this[string keyId] => "static_key";
    public IEnumerable<string> GetAllKeyIds() => [ CurrentKeyId ];
}