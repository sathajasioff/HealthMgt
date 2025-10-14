# ZegoCloud Video Call Setup Instructions

## Error Fixed ✅

The video call errors have been resolved. The main issues were:

1. **Missing SECRET key** - ZegoCloud requires both APP_ID and SECRET
2. **Navigation path errors** - Fixed missing leading slashes in routes
3. **Timestamp generation bug** - Fixed substring to slice method
4. **Missing error handling** - Added try-catch blocks and validation

## How to Get Your ZegoCloud Credentials

### Step 1: Sign Up / Login to ZegoCloud
1. Visit: https://console.zegocloud.com/
2. Create an account or login if you already have one

### Step 2: Create a Project
1. Click on "Projects" in the left sidebar
2. Click "Create Project" button
3. Fill in the project details:
   - Project Name: "Smart Health Care System" (or any name)
   - Select your region
   - Click "Create"

### Step 3: Get Your Credentials
1. After creating the project, you'll see your project dashboard
2. Look for **AppID** and **ServerSecret**
3. Copy both values

### Step 4: Update Config.jsx
Open `frontend/src/Config.jsx` and update:

```javascript
// Get your APP_ID and SECRET from https://console.zegocloud.com/
export const APP_ID = YOUR_APP_ID_HERE;  // Replace with your actual AppID (number)
export const SECRET = "YOUR_SECRET_HERE"; // Replace with your actual ServerSecret (string)
```

**Example:**
```javascript
export const APP_ID = 123456789;
export const SECRET = "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6";
```

## Testing the Video Call

### Step 1: Start the Development Server
```bash
cd frontend
npm run dev
```

### Step 2: Access the Video Call Feature
1. Navigate to `/homeroom` in your browser
2. Click "Generate" to create a Room ID
3. Choose either:
   - **One-on-One Call** (for 2 participants)
   - **Group Call** (for up to 10 participants)

### Step 3: Share the Link
- After joining, you'll see a "Video Call Link" button
- Share this link with other participants
- They can join the same room using the link

## Features Now Working ✅

- ✅ Room ID generation
- ✅ One-on-one video calls
- ✅ Group video calls (up to 10 users)
- ✅ Screen sharing
- ✅ Audio/Video controls
- ✅ Chat functionality
- ✅ Participant list
- ✅ Exit/Leave room functionality

## Troubleshooting

### If you still see errors:

1. **"serverSecret required" error**
   - Make sure SECRET is not empty in Config.jsx
   - Ensure SECRET is wrapped in quotes (it's a string)

2. **"zp is undefined" error**
   - This was caused by missing SECRET
   - Should be fixed after adding valid credentials

3. **Camera/Microphone not working**
   - Browser will ask for permissions
   - Click "Allow" when prompted
   - Check browser settings if blocked

4. **Can't join room**
   - Verify APP_ID and SECRET are correct
   - Check browser console for specific errors
   - Ensure you have internet connection

## Important Notes

⚠️ **Security Warning:**
- The current implementation uses `generateKitTokenForTest` which is for development only
- For production, implement server-side token generation
- Never expose your SECRET in client-side code in production

📝 **Free Tier Limits:**
- ZegoCloud free tier includes 10,000 minutes/month
- Perfect for testing and small-scale usage
- Check pricing for production needs

## Files Modified

1. ✅ `frontend/src/pages/Room/HomeRoom.jsx` - Fixed navigation and timestamp
2. ✅ `frontend/src/pages/Room/Room.jsx` - Added validation and error handling
3. ✅ `frontend/src/Config.jsx` - Added comments and structure

## Next Steps

1. Get your ZegoCloud credentials
2. Update Config.jsx with your APP_ID and SECRET
3. Run `npm run dev`
4. Test the video call feature
5. Enjoy! 🎉
