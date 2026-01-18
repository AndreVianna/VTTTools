import React from 'react';

// Mock MUI icon component - returns an empty SVG with semantic attributes
const createMockIcon = (displayName: string) => {
    const MockIcon = React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => (
        <svg ref={ref} role="img" aria-label={displayName} {...props} />
    ));
    MockIcon.displayName = displayName;
    return MockIcon;
};

// Common icons used in the codebase - add more as needed
export const Add = createMockIcon('Add');
export const AddCircle = createMockIcon('AddCircle');
export const ArrowBack = createMockIcon('ArrowBack');
export const ArrowForward = createMockIcon('ArrowForward');
export const Check = createMockIcon('Check');
export const CheckCircle = createMockIcon('CheckCircle');
export const ChevronLeft = createMockIcon('ChevronLeft');
export const ChevronRight = createMockIcon('ChevronRight');
export const Close = createMockIcon('Close');
export const ContentCopy = createMockIcon('ContentCopy');
export const Delete = createMockIcon('Delete');
export const Edit = createMockIcon('Edit');
export const ExpandLess = createMockIcon('ExpandLess');
export const ExpandMore = createMockIcon('ExpandMore');
export const Folder = createMockIcon('Folder');
export const GridOn = createMockIcon('GridOn');
export const GridOff = createMockIcon('GridOff');
export const Help = createMockIcon('Help');
export const Home = createMockIcon('Home');
export const Image = createMockIcon('Image');
export const Info = createMockIcon('Info');
export const Layers = createMockIcon('Layers');
export const Lock = createMockIcon('Lock');
export const LockOpen = createMockIcon('LockOpen');
export const Menu = createMockIcon('Menu');
export const MoreVert = createMockIcon('MoreVert');
export const NavigateNext = createMockIcon('NavigateNext');
export const NavigateBefore = createMockIcon('NavigateBefore');
export const OpenInNew = createMockIcon('OpenInNew');
export const Palette = createMockIcon('Palette');
export const PanTool = createMockIcon('PanTool');
export const People = createMockIcon('People');
export const Person = createMockIcon('Person');
export const PhotoCamera = createMockIcon('PhotoCamera');
export const PlayArrow = createMockIcon('PlayArrow');
export const Redo = createMockIcon('Redo');
export const Refresh = createMockIcon('Refresh');
export const Remove = createMockIcon('Remove');
export const Save = createMockIcon('Save');
export const Search = createMockIcon('Search');
export const Settings = createMockIcon('Settings');
export const Undo = createMockIcon('Undo');
export const Upload = createMockIcon('Upload');
export const Visibility = createMockIcon('Visibility');
export const VisibilityOff = createMockIcon('VisibilityOff');
export const Warning = createMockIcon('Warning');
export const ZoomIn = createMockIcon('ZoomIn');
export const ZoomOut = createMockIcon('ZoomOut');
export const ZoomOutMap = createMockIcon('ZoomOutMap');

// Encounter editor icons
export const DrawOutlined = createMockIcon('DrawOutlined');
export const Wallpaper = createMockIcon('Wallpaper');
export const Group = createMockIcon('Group');
export const ViewInAr = createMockIcon('ViewInAr');
export const Restore = createMockIcon('Restore');
export const BorderStyle = createMockIcon('BorderStyle');
export const Pets = createMockIcon('Pets');
export const VolumeUp = createMockIcon('VolumeUp');
export const VolumeOff = createMockIcon('VolumeOff');
export const Videocam = createMockIcon('Videocam');
export const Pause = createMockIcon('Pause');
export const BorderAll = createMockIcon('BorderAll');
export const Clear = createMockIcon('Clear');
export const Cancel = createMockIcon('Cancel');
export const Lightbulb = createMockIcon('Lightbulb');
export const Fence = createMockIcon('Fence');

// Asset/entity related
export const Category = createMockIcon('Category');
export const Terrain = createMockIcon('Terrain');
export const Brightness4 = createMockIcon('Brightness4');
export const Brightness7 = createMockIcon('Brightness7');
export const Cloud = createMockIcon('Cloud');
export const Crop = createMockIcon('Crop');
export const CropFree = createMockIcon('CropFree');
export const FolderOpen = createMockIcon('FolderOpen');
export const LightMode = createMockIcon('LightMode');
export const DarkMode = createMockIcon('DarkMode');
export const Map = createMockIcon('Map');
export const MyLocation = createMockIcon('MyLocation');
export const NearMe = createMockIcon('NearMe');
export const Place = createMockIcon('Place');
export const Straighten = createMockIcon('Straighten');
export const Square = createMockIcon('Square');
export const Circle = createMockIcon('Circle');
export const Rectangle = createMockIcon('Rectangle');
export const Hexagon = createMockIcon('Hexagon');
export const Pentagon = createMockIcon('Pentagon');

// Navigation/drawer icons
export const AccountCircle = createMockIcon('AccountCircle');
export const Dashboard = createMockIcon('Dashboard');
export const Logout = createMockIcon('Logout');
export const Login = createMockIcon('Login');
export const MenuOpen = createMockIcon('MenuOpen');

// Tool icons
export const Build = createMockIcon('Build');
export const ColorLens = createMockIcon('ColorLens');
export const Create = createMockIcon('Create');
export const Gesture = createMockIcon('Gesture');
export const Mouse = createMockIcon('Mouse');
export const SelectAll = createMockIcon('SelectAll');
export const Timeline = createMockIcon('Timeline');
export const TouchApp = createMockIcon('TouchApp');
export const Texture = createMockIcon('Texture');

// Wall/door icons
export const DoorBack = createMockIcon('DoorBack');
export const DoorFront = createMockIcon('DoorFront');
export const DoorSliding = createMockIcon('DoorSliding');
export const MeetingRoom = createMockIcon('MeetingRoom');
export const NoMeetingRoom = createMockIcon('NoMeetingRoom');
export const Window = createMockIcon('Window');

// Region icons
export const FormatColorFill = createMockIcon('FormatColorFill');
export const Highlight = createMockIcon('Highlight');
export const HighlightAlt = createMockIcon('HighlightAlt');
export const Polyline = createMockIcon('Polyline');
export const ShowChart = createMockIcon('ShowChart');

// Editor icons
export const CenterFocusStrong = createMockIcon('CenterFocusStrong');
export const CenterFocusWeak = createMockIcon('CenterFocusWeak');
export const FilterCenterFocus = createMockIcon('FilterCenterFocus');
export const Flip = createMockIcon('Flip');
export const FlipToBack = createMockIcon('FlipToBack');
export const FlipToFront = createMockIcon('FlipToFront');
export const FormatPaint = createMockIcon('FormatPaint');
export const Fullscreen = createMockIcon('Fullscreen');
export const FullscreenExit = createMockIcon('FullscreenExit');
export const KeyboardArrowDown = createMockIcon('KeyboardArrowDown');
export const KeyboardArrowUp = createMockIcon('KeyboardArrowUp');
export const KeyboardArrowLeft = createMockIcon('KeyboardArrowLeft');
export const KeyboardArrowRight = createMockIcon('KeyboardArrowRight');
export const RotateLeft = createMockIcon('RotateLeft');
export const RotateRight = createMockIcon('RotateRight');
export const Transform = createMockIcon('Transform');

// Filter icons
export const FilterList = createMockIcon('FilterList');

// Misc
export const Apps = createMockIcon('Apps');
export const Autorenew = createMockIcon('Autorenew');
export const Error = createMockIcon('Error');
export const ErrorOutline = createMockIcon('ErrorOutline');
export const InsertDriveFile = createMockIcon('InsertDriveFile');
export const Link = createMockIcon('Link');
export const List = createMockIcon('List');
export const LocalLibrary = createMockIcon('LocalLibrary');
export const Notifications = createMockIcon('Notifications');
export const Public = createMockIcon('Public');
export const Schedule = createMockIcon('Schedule');
export const Security = createMockIcon('Security');
export const Send = createMockIcon('Send');
export const Star = createMockIcon('Star');
export const StarBorder = createMockIcon('StarBorder');
export const Timer = createMockIcon('Timer');
export const VideoLibrary = createMockIcon('VideoLibrary');
export const ViewList = createMockIcon('ViewList');
export const ViewModule = createMockIcon('ViewModule');
export const WifiOff = createMockIcon('WifiOff');
export const Wifi = createMockIcon('Wifi');

// Default export as Proxy for any icons not explicitly defined
const handler: ProxyHandler<Record<string, unknown>> = {
    get(target, prop: string) {
        // Return existing export if available
        if (prop in target) {
            return target[prop];
        }
        if (prop === '__esModule') return true;
        if (prop === 'default') return createMockIcon('Default');
        // Create mock for any undefined icon
        return createMockIcon(prop);
    },
};

// Export the module as a proxy to handle any icon imports
const proxyModule = new Proxy(
    {
        Add, AddCircle, ArrowBack, ArrowForward, Check, CheckCircle, ChevronLeft, ChevronRight, Close,
        ContentCopy, Delete, Edit, ExpandLess, ExpandMore, Folder, GridOn, GridOff, Help, Home, Image,
        Info, Layers, Lock, LockOpen, Menu, MoreVert, NavigateNext, NavigateBefore, OpenInNew, Palette,
        PanTool, People, Person, PhotoCamera, PlayArrow, Redo, Refresh, Remove, Save, Search, Settings,
        Undo, Upload, Visibility, VisibilityOff, Warning, ZoomIn, ZoomOut, ZoomOutMap, DrawOutlined, Wallpaper, Group,
        ViewInAr, Restore, BorderStyle, Pets, VolumeUp, VolumeOff, Videocam, Pause, BorderAll, Clear, Cancel, Lightbulb, Fence,
        Category, Terrain, Brightness4,
        Brightness7, Cloud, Crop, CropFree, FolderOpen, LightMode, DarkMode, Map, MyLocation, NearMe,
        Place, Straighten, Square, Circle, Rectangle, Hexagon, Pentagon, AccountCircle, Dashboard, Logout,
        Login, MenuOpen, Build, ColorLens, Create, Gesture, Mouse, SelectAll, Timeline, TouchApp, Texture,
        DoorBack, DoorFront, DoorSliding, MeetingRoom, NoMeetingRoom, Window, FormatColorFill, Highlight,
        HighlightAlt, Polyline, ShowChart, CenterFocusStrong, CenterFocusWeak, FilterCenterFocus, Flip, FlipToBack,
        FlipToFront, FormatPaint, Fullscreen, FullscreenExit, KeyboardArrowDown, KeyboardArrowUp,
        KeyboardArrowLeft, KeyboardArrowRight, RotateLeft, RotateRight, Transform, Apps, Autorenew,
        Error, ErrorOutline, InsertDriveFile, Link, List, LocalLibrary, Notifications, Public, Schedule,
        Security, Send, Star, StarBorder, Timer, VideoLibrary, ViewList, ViewModule, WifiOff, Wifi, FilterList,
    } as Record<string, unknown>,
    handler
);

// eslint-disable-next-line react-refresh/only-export-components
export default proxyModule;
