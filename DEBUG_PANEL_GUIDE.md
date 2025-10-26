# 🔧 Performance Debug Panel - Guía de Uso

## Activar el Debug Panel

Para mostrar el botón de debug, agrega `?debug=1` a la URL:
```
http://localhost:5001?debug=1
```

## Ubicación y Funcionalidad

- **Botón flotante**: Esquina inferior derecha (icono de engranaje)
- **Badge de contador**: Muestra cuántos flags están activos
- **Panel lateral**: Se abre al hacer clic en el botón

## Categorías de Performance Flags

### 📊 **LCP/CLS** (Largest Contentful Paint / Cumulative Layout Shift)
- ✅ **Hero Preload**: Preload hero image para LCP más rápido
- ✅ **Hero Fetch Priority**: High priority fetch para imágenes críticas
- ✅ **Font Preconnect**: Preconnect to fonts para reducir render blocking
- ✅ **Reserve Hero Space**: Fixed hero dimensions para evitar CLS
- ❌ **Late Banner**: Banner causes CLS (simula layout shift)

### 🌐 **Coverage/Network** (Cobertura de código / Red)
- ❌ **Third Party Script**: Heavy blocking script (simula scripts pesados)
- ❌ **Extra CSS**: Unused CSS rules (simula código no usado)
- ❌ **Disable Lazy Loading**: Load all images eagerly (afecta performance)

### ⚡ **INP/Long Tasks** (Interaction to Next Paint / Tareas largas)
- ✅ **Passive Listeners**: Use passive event listeners para mejorar INP
- ❌ **Simulate Long Task**: Block main thread 120ms (simula bloqueo)
- ✅ **Use Worker**: Move work to worker thread para liberar main thread

### 🔍 **Search/Input** (Búsqueda e input)
- ✅ **Debounce Input**: Debounce search input para reducir requests
- ✅ **Micro Yield**: Yield between chunks para mejor responsiveness

### 🎨 **CLS/UX** (Layout Shift / Experiencia de usuario)
- ❌ **Missing Image Sizes**: Images without dimensions (causa CLS)
- ✅ **Intrinsic Placeholders**: Use content-visibility para mejor UX

## Uso en Videos de Demo

### Video 1: LCP Optimization
```
Flags ON: heroPreload, heroFetchPriorityHigh, fontPreconnect, reserveHeroSpace
Flags OFF: lateBanner
```

### Video 2: Network Analysis  
```
Flags ON: injectThirdParty, loadExtraCSS
Flags OFF: lazyOff
```

### Video 3: INP Problems
```
Flags ON: simulateLongTask
Flags OFF: listenersPassive, useWorker
```

### Video 4: Input Responsiveness
```
Flags ON: debounce, microYield, listenersPassive
Flags OFF: simulateLongTask
```

### Video 5: Layout Stability
```
Flags ON: missingSizes, lateBanner
Flags OFF: reserveHeroSpace, intrinsicPlaceholders
```

## Tips para la Charla

1. **Mantén el panel visible** durante las grabaciones para mostrar qué flags están activos
2. **El contador en el botón** muestra inmediatamente cuántos problemas están simulados
3. **Cambia flags en vivo** para mostrar impacto inmediato en DevTools
4. **Usa Chrome DevTools** en paralelo para mostrar métricas reales

## Estado Actual Verificado ✅

Después de las optimizaciones del carrito, el Debug Panel:
- ✅ Se activa correctamente con `?debug=1`
- ✅ Todos los flags funcionan como esperado
- ✅ Performance utilities están intactas
- ✅ No hay conflictos con el nuevo sistema de carrito
- ✅ Compatible con las imágenes locales

¡Listo para tu charla en JSConf-MX! 🚀