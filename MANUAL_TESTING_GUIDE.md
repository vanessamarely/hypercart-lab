# Manual Testing Guide for Performance Flags

## Testing Setup
1. Open the application: `npm run dev`
2. Navigate to: `http://localhost:5173/search?debug=1`
3. Open Chrome DevTools → Console tab
4. Open Performance panel (for Long Task analysis)

## Test Scenarios

### 🧪 Test 1: Web Worker Toggle
**Objective**: Verify `useWorker` flag toggles between main thread and worker processing

**Steps**:
1. Ensure `useWorker` flag is **OFF** in debug panel
2. Type "phone" in search box
3. Check console for: "🟡 Using main thread for search processing"
4. Toggle `useWorker` flag **ON**
5. Type "case" in search box  
6. Check console for: "🟢 Using Web Worker for search processing"
7. Verify status indicator changes from yellow to green dot

**Expected Results**:
- Console logs should clearly indicate which processing method is used
- Visual indicator should change color
- With Web Worker: No main thread blocking in Performance panel
- Without Web Worker: Visible main thread blocking

### 🧪 Test 2: Debounce Toggle
**Objective**: Verify `debounce` flag controls search frequency

**Steps**:
1. Ensure `debounce` flag is **OFF**
2. Type rapidly: "s-m-a-r-t-p-h-o-n-e" (one letter at a time)
3. Check console - should see multiple "⚡ Immediate search" logs
4. Toggle `debounce` flag **ON**
5. Type rapidly: "w-i-r-e-l-e-s-s" (one letter at a time)
6. Check console - should see "⏰ Debounced search scheduled" logs

**Expected Results**:
- Without debounce: Search triggered on every keystroke
- With debounce: Search only triggered after 300ms delay
- Console logs clearly indicate the mode

### 🧪 Test 3: Micro-Yield Toggle
**Objective**: Verify `microYield` flag affects processing method

**Steps**:
1. Ensure `microYield` flag is **OFF** and `useWorker` is **OFF**
2. Type "product" in search box
3. Check console for: "⚠️ Processing all at once (blocking)"
4. Toggle `microYield` flag **ON**
5. Type "electronics" in search box
6. Check console for: "🔄 Using micro-yield processing"

**Expected Results**:
- Without micro-yield: Single blocking operation
- With micro-yield: Chunked processing with yields
- Performance panel should show difference in main thread activity

### 🧪 Test 4: Flag Persistence
**Objective**: Verify flags persist across page reloads

**Steps**:
1. Set `useWorker` **ON**, `debounce` **ON**, `microYield` **ON**
2. Refresh the page (F5)
3. Navigate back to search page with debug: `/search?debug=1`
4. Verify all flags are still enabled
5. Type a search term and verify behavior matches enabled flags

**Expected Results**:
- All flags should remain in their set state after reload
- Behavior should be consistent with flag states

### 🧪 Test 5: Visual Indicators
**Objective**: Verify UI correctly reflects flag states

**Steps**:
1. Start with all flags **OFF**
2. Type "test" - should see yellow dot: "Search processing on main thread (blocking)"
3. Enable `microYield` - should see: "Search processing on main thread (with micro-yields)"
4. Enable `useWorker` - should see green dot: "Search processing in Web Worker (non-blocking)"
5. Enable `debounce` - should see "(debounced)" in results counter

**Expected Results**:
- Status indicators accurately reflect current optimization state
- Color coding: Green = Web Worker, Yellow = Main thread
- Additional flags show in results description

## Performance Measurement Tests

### 🔬 Long Task Analysis
1. Open Performance panel
2. Start recording
3. With `useWorker` **OFF**: Type rapid search
4. Stop recording → Look for red Long Task blocks (>50ms)
5. Clear, start new recording  
6. With `useWorker` **ON**: Type same search
7. Stop recording → Should see no/fewer Long Task blocks

### 🔬 Main Thread Analysis
1. Record performance with all optimization flags **OFF**
2. Note main thread blocking during search operations
3. Enable optimizations one by one:
   - First: `microYield` (should see reduced blocking)
   - Then: `useWorker` (should see minimal main thread activity)
4. Compare timeline sections for each configuration

## Expected Console Output Examples

### Without Optimizations:
```
⚡ Immediate search for: p
🔍 Search initiated with flags: {useWorker: false, microYield: false, debounce: false, query: "p"}
🟡 Using main thread for search processing
🔄 Starting main thread search with microYield: false
⏱️ Heavy computation took: 12.50ms
⚠️ Processing all at once (blocking)
📊 Main thread search completed, found 8 results
```

### With All Optimizations:
```
⏰ Debounced search scheduled for: phone
⏰ Executing debounced search for: phone
🔍 Search initiated with flags: {useWorker: true, microYield: true, debounce: true, query: "phone"}
🟢 Using Web Worker for search processing
✅ Web Worker search completed, results: 3
```

## Troubleshooting

**If flags don't seem to work**:
1. Check localStorage in DevTools → Application → Storage
2. Look for `hypercart-flags` key
3. Clear localStorage and try again
4. Check console for any JavaScript errors

**If Web Worker fails**:
- Check Network tab for `/worker.js` 404 errors
- Verify HTTPS/localhost requirement
- Check console for worker initialization errors

**If visual indicators don't update**:
- Hard refresh (Cmd+Shift+R / Ctrl+Shift+F5)
- Check that debug panel is visible (?debug=1 in URL)
- Verify flags are being set in localStorage