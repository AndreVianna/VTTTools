namespace VttTools.Library.Stages.Model;

public enum SegmentState {
    Open = 0,
    Closed = 1,
    Locked = 2,
    Visible = Locked, // valid only for barriers
    Secret = 3,
}