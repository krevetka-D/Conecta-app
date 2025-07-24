# Surface Overflow Warning Fix

## Issue
When setting `overflow: 'hidden'` on a React Native Paper `Surface` component, shadows may not display correctly.

## Solution
Wrap the content in a separate View with the overflow style instead of applying it directly to Surface.

### Before (causes warning):
```jsx
<Surface style={{ overflow: 'hidden', ...otherStyles }}>
  <Content />
</Surface>
```

### After (fixed):
```jsx
<Surface style={otherStyles}>
  <View style={{ overflow: 'hidden' }}>
    <Content />
  </View>
</Surface>
```

## Alternative Solutions

1. **Remove overflow from Surface styles**:
   ```jsx
   const { overflow, ...surfaceStyles } = styles.surface;
   
   <Surface style={surfaceStyles}>
     <View style={{ overflow }}>
       <Content />
     </View>
   </Surface>
   ```

2. **Use Card instead of Surface** (if elevation is needed):
   ```jsx
   <Card style={styles.card}>
     <View style={{ overflow: 'hidden' }}>
       <Content />
     </View>
   </Card>
   ```

3. **Disable elevation** (if shadows aren't needed):
   ```jsx
   <Surface style={{ ...styles, elevation: 0 }}>
     <Content />
   </Surface>
   ```

## To Find and Fix All Occurrences

1. Search for Surface components with overflow:
   ```bash
   grep -r "Surface.*overflow" src/
   ```

2. Search in style files:
   ```bash
   grep -r "overflow.*hidden" src/styles/
   ```

3. Check styled components or dynamic styles that might add overflow to Surface components.