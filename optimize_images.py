#!/usr/bin/env python3
"""
Скрипт для оптимизации изображений сайта Кудо Скала
Конвертирует JPEG/PNG в WebP с сохранением качества
"""

import os
import sys
from PIL import Image
import glob

def optimize_image(input_path, output_path, quality=85, max_width=1920):
    """
    Оптимизирует изображение:
    - Конвертирует в WebP
    - Изменяет размер если нужно
    - Применяет сжатие
    """
    try:
        # Открываем изображение
        with Image.open(input_path) as img:
            # Конвертируем в RGB если нужно (для PNG с прозрачностью)
            if img.mode in ('RGBA', 'LA', 'P'):
                # Создаем белый фон для прозрачных изображений
                background = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                img = background
            elif img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Изменяем размер если изображение слишком большое
            if img.width > max_width:
                ratio = max_width / img.width
                new_height = int(img.height * ratio)
                img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)
            
            # Сохраняем в WebP
            img.save(output_path, 'WebP', quality=quality, optimize=True)
            
            # Получаем размеры файлов
            original_size = os.path.getsize(input_path)
            new_size = os.path.getsize(output_path)
            savings = ((original_size - new_size) / original_size) * 100
            
            print(f"✓ {os.path.basename(input_path)}: {original_size//1024}KB → {new_size//1024}KB ({savings:.1f}% экономии)")
            
            return True
            
    except Exception as e:
        print(f"✗ Ошибка при обработке {input_path}: {e}")
        return False

def main():
    """Основная функция"""
    print("🖼️  Оптимизация изображений для сайта Кудо Скала")
    print("=" * 50)
    
    # Папки для обработки
    folders = [
        "foto",
        "sorevnovaniya/pskov_okt_2025",
        "sorevnovaniya/vyborg_sent_2025"
    ]
    
    total_processed = 0
    total_savings = 0
    
    for folder in folders:
        if not os.path.exists(folder):
            print(f"⚠️  Папка {folder} не найдена, пропускаем")
            continue
            
        print(f"\n📁 Обрабатываем папку: {folder}")
        
        # Ищем все изображения
        patterns = ['*.jpg', '*.jpeg', '*.png']
        images = []
        for pattern in patterns:
            images.extend(glob.glob(os.path.join(folder, pattern)))
        
        if not images:
            print("  Нет изображений для обработки")
            continue
        
        # Создаем папку для WebP если её нет
        webp_folder = f"{folder}_webp"
        os.makedirs(webp_folder, exist_ok=True)
        
        for img_path in images:
            filename = os.path.basename(img_path)
            name, ext = os.path.splitext(filename)
            webp_path = os.path.join(webp_folder, f"{name}.webp")
            
            if optimize_image(img_path, webp_path):
                total_processed += 1
    
    print(f"\n🎉 Обработано изображений: {total_processed}")
    print("\n📝 Следующие шаги:")
    print("1. Проверьте качество WebP файлов")
    print("2. Обновите HTML для использования WebP")
    print("3. Добавьте fallback на оригинальные форматы")

if __name__ == "__main__":
    main()
