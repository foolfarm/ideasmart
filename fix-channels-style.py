import os
import re

pages = [
    '/home/ubuntu/ideasmart/client/src/pages/AiHome.tsx',
    '/home/ubuntu/ideasmart/client/src/pages/StartupHome.tsx',
    '/home/ubuntu/ideasmart/client/src/pages/Research.tsx',
    '/home/ubuntu/ideasmart/client/src/pages/DealroomHome.tsx',
    '/home/ubuntu/ideasmart/client/src/pages/NewsArticle.tsx',
    '/home/ubuntu/ideasmart/client/src/pages/GenericNewsArticle.tsx',
    '/home/ubuntu/ideasmart/client/src/pages/ResearchDetail.tsx',
    '/home/ubuntu/ideasmart/client/src/pages/StartupNewsArticle.tsx',
]

for path in pages:
    if not os.path.exists(path):
        print(f'SKIP (not found): {path}')
        continue
    
    with open(path, 'r') as f:
        content = f.read()
    
    original = content
    
    # 1. Sostituisci sfondi crema/giallognolo con bianco Apple
    for old_color in ['#faf8f3', '#faf8f5', '#f5f2ec', '#f5f0e8', '#fdf8f0', '#fffbf5', '#f9f6f0', '#f8f5ef']:
        content = content.replace(old_color, '#ffffff')
    
    # 2. Sostituisci font Georgia con SF Pro
    content = content.replace("fontFamily: \"Georgia, serif\"", "fontFamily: \"-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif\"")
    content = content.replace("font-family: Georgia", "font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif")
    
    # 3. Aggiungi border-radius alle immagini hero (height: "320px" senza borderRadius)
    content = re.sub(
        r'style=\{\{ height: "320px", border: "1px solid rgba\(26,26,46,0\.12\)" \}\}',
        'style={{ height: "420px", borderRadius: "10px", border: "1px solid rgba(26,26,46,0.07)", boxShadow: "0 2px 20px rgba(0,0,0,0.06)" }}',
        content
    )
    content = re.sub(
        r'style=\{\{ height: "320px", border: "1px solid rgba\(26,26,46,0\.10\)" \}\}',
        'style={{ height: "420px", borderRadius: "10px", border: "1px solid rgba(26,26,46,0.07)" }}',
        content
    )
    
    # 4. Immagini secondarie 160px → 200px con border-radius
    content = re.sub(
        r'style=\{\{ height: "160px", border: "1px solid rgba\(26,26,46,0\.10\)" \}\}',
        'style={{ height: "200px", borderRadius: "8px", border: "1px solid rgba(26,26,46,0.07)" }}',
        content
    )
    
    # 5. Badge categoria: aggiungi borderRadius: "4px" dove manca
    content = re.sub(
        r'(className="[^"]*text-\[10px\][^"]*uppercase[^"]*px-1\.5[^"]*py-0\.5[^"]*")\s*\n(\s*style=\{\{ background: [^,]+, color: "#fff"[^}]*)\}\}',
        lambda m: m.group(1) + '\n' + m.group(2) + ', borderRadius: "4px" }}',
        content
    )
    
    # 6. Titoli hero: aggiungi letterSpacing dove manca
    content = re.sub(
        r'(fontSize: "clamp\(30px[^"]*\)", fontWeight: 800, lineHeight: 1\.15)',
        'fontSize: "clamp(32px, 4.5vw, 50px)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.025em"',
        content
    )
    content = re.sub(
        r'(fontSize: "clamp\(30px[^"]*\)", fontWeight: 800, lineHeight: 1\.2)',
        'fontSize: "clamp(32px, 4.5vw, 50px)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.025em"',
        content
    )
    
    if content != original:
        with open(path, 'w') as f:
            f.write(content)
        print(f'UPDATED: {os.path.basename(path)}')
    else:
        print(f'NO CHANGES: {os.path.basename(path)}')

print('All done.')
