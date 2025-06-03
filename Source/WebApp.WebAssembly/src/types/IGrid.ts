interface IGrid {
    readonly type: GridType;
    readonly cell: ISize;
    readonly offset: IPoint;
    readonly snap: boolean;
}

