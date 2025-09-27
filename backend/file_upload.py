import os
import uuid
import shutil
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import aiofiles
import magic
from PIL import Image
from fastapi import UploadFile, HTTPException
import logging

logger = logging.getLogger(__name__)

class FileUploadConfig:
    """Configuration for file uploads"""
    
    # Base upload directory
    UPLOAD_BASE_DIR = Path("uploads")
    
    # Subdirectories for different file types
    DIRECTORIES = {
        "cars": UPLOAD_BASE_DIR / "cars",
        "avatars": UPLOAD_BASE_DIR / "avatars", 
        "logos": UPLOAD_BASE_DIR / "logos"
    }
    
    # Allowed file types
    ALLOWED_MIME_TYPES = {
        "cars": ["image/jpeg", "image/png", "image/webp"],
        "avatars": ["image/jpeg", "image/png"],
        "logos": ["image/jpeg", "image/png", "image/svg+xml"]
    }
    
    # Maximum file sizes (in bytes)
    MAX_FILE_SIZES = {
        "cars": 50 * 1024 * 1024,    # 50MB for car images
        "avatars": 5 * 1024 * 1024,   # 5MB for avatars
        "logos": 10 * 1024 * 1024     # 10MB for logos
    }
    
    # Image processing sizes
    CAR_IMAGE_SIZES = {
        "thumbnail": (300, 225),
        "medium": (800, 600),
        "large": (1200, 900)
    }
    
    AVATAR_SIZES = {
        "small": (64, 64),
        "medium": (128, 128),
        "large": (256, 256)
    }
    
    LOGO_SIZES = {
        "small": (100, 50),
        "medium": (200, 100),
        "large": (400, 200)
    }

class FileValidator:
    """File validation utilities"""
    
    @staticmethod
    def validate_file_type(file_content: bytes, category: str) -> bool:
        """Validate file type using magic numbers"""
        try:
            detected_mime = magic.from_buffer(file_content, mime=True)
            allowed_types = FileUploadConfig.ALLOWED_MIME_TYPES.get(category, [])
            return detected_mime in allowed_types
        except Exception as e:
            logger.error(f"File type validation error: {e}")
            return False
    
    @staticmethod
    def validate_file_size(file_size: int, category: str) -> bool:
        """Validate file size"""
        max_size = FileUploadConfig.MAX_FILE_SIZES.get(category, 1024 * 1024)  # Default 1MB
        return file_size <= max_size
    
    @staticmethod
    def validate_image_dimensions(image: Image.Image, category: str) -> bool:
        """Validate image dimensions"""
        width, height = image.size
        
        if category == "cars":
            return width >= 400 and height >= 300  # Minimum size for car images
        elif category == "avatars":
            return width >= 64 and height >= 64    # Minimum size for avatars
        elif category == "logos":
            return width >= 32 and height >= 32    # Minimum size for logos
            
        return True

class ImageProcessor:
    """Image processing utilities"""
    
    @staticmethod
    def process_car_image(image_path: Path, car_id: str) -> Dict[str, str]:
        """Process car image into multiple sizes"""
        results = {}
        
        try:
            with Image.open(image_path) as img:
                # Convert to RGB if necessary
                if img.mode in ('RGBA', 'P'):
                    img = img.convert('RGB')
                
                # Generate different sizes
                for size_name, dimensions in FileUploadConfig.CAR_IMAGE_SIZES.items():
                    processed_img = img.copy()
                    processed_img.thumbnail(dimensions, Image.Resampling.LANCZOS)
                    
                    # Save processed image
                    base_name = image_path.stem
                    output_path = image_path.parent / f"{base_name}_{size_name}.jpg"
                    processed_img.save(output_path, 'JPEG', quality=85, optimize=True)
                    
                    results[size_name] = str(output_path.relative_to(FileUploadConfig.UPLOAD_BASE_DIR))
                
                # Save optimized original
                img.save(image_path, 'JPEG', quality=90, optimize=True)
                results['original'] = str(image_path.relative_to(FileUploadConfig.UPLOAD_BASE_DIR))
                
        except Exception as e:
            logger.error(f"Car image processing error: {e}")
            
        return results
    
    @staticmethod
    def process_avatar_image(image_path: Path, user_id: str) -> Dict[str, str]:
        """Process avatar image into multiple sizes"""
        results = {}
        
        try:
            with Image.open(image_path) as img:
                # Convert to RGB
                if img.mode in ('RGBA', 'P'):
                    img = img.convert('RGB')
                
                # Create square crop
                width, height = img.size
                size = min(width, height)
                left = (width - size) // 2
                top = (height - size) // 2
                img = img.crop((left, top, left + size, top + size))
                
                # Generate different sizes
                for size_name, dimensions in FileUploadConfig.AVATAR_SIZES.items():
                    processed_img = img.copy()
                    processed_img = processed_img.resize(dimensions, Image.Resampling.LANCZOS)
                    
                    # Save processed image
                    base_name = image_path.stem
                    output_path = image_path.parent / f"{base_name}_{size_name}.jpg"
                    processed_img.save(output_path, 'JPEG', quality=85, optimize=True)
                    
                    results[size_name] = str(output_path.relative_to(FileUploadConfig.UPLOAD_BASE_DIR))
                
        except Exception as e:
            logger.error(f"Avatar processing error: {e}")
            
        return results
    
    @staticmethod
    def process_logo_image(image_path: Path, dealer_id: str) -> Dict[str, str]:
        """Process logo image maintaining aspect ratio"""
        results = {}
        
        try:
            with Image.open(image_path) as img:
                # Preserve transparency for PNG
                if img.format == 'PNG' and img.mode in ('RGBA', 'LA'):
                    # Generate PNG versions with transparency
                    for size_name, max_dimensions in FileUploadConfig.LOGO_SIZES.items():
                        processed_img = img.copy()
                        processed_img.thumbnail(max_dimensions, Image.Resampling.LANCZOS)
                        
                        base_name = image_path.stem
                        output_path = image_path.parent / f"{base_name}_{size_name}.png"
                        processed_img.save(output_path, 'PNG', optimize=True)
                        
                        results[f"{size_name}_png"] = str(output_path.relative_to(FileUploadConfig.UPLOAD_BASE_DIR))
                
                # Always create JPG versions
                if img.mode in ('RGBA', 'LA', 'P'):
                    # Create white background for JPG
                    jpg_img = Image.new('RGB', img.size, 'white')
                    if img.mode == 'RGBA':
                        jpg_img.paste(img, mask=img.split()[-1])
                    else:
                        jpg_img.paste(img.convert('RGBA'), mask=img.convert('RGBA').split()[-1])
                    img = jpg_img
                
                for size_name, max_dimensions in FileUploadConfig.LOGO_SIZES.items():
                    processed_img = img.copy()
                    processed_img.thumbnail(max_dimensions, Image.Resampling.LANCZOS)
                    
                    base_name = image_path.stem
                    output_path = image_path.parent / f"{base_name}_{size_name}.jpg"
                    processed_img.save(output_path, 'JPEG', quality=90, optimize=True)
                    
                    results[f"{size_name}_jpg"] = str(output_path.relative_to(FileUploadConfig.UPLOAD_BASE_DIR))
                
        except Exception as e:
            logger.error(f"Logo processing error: {e}")
            
        return results

class FileUploadService:
    """Main file upload service"""
    
    def __init__(self):
        self._ensure_directories()
    
    def _ensure_directories(self):
        """Ensure upload directories exist"""
        for directory in FileUploadConfig.DIRECTORIES.values():
            directory.mkdir(parents=True, exist_ok=True)
    
    async def upload_file(
        self, 
        file: UploadFile, 
        category: str,
        entity_id: str,
        file_type: str = "image"
    ) -> Dict[str, any]:
        """Upload and process a file"""
        
        # Validate category
        if category not in FileUploadConfig.DIRECTORIES:
            raise HTTPException(status_code=400, detail=f"Invalid category: {category}")
        
        # Read file content
        file_content = await file.read()
        await file.seek(0)
        
        # Validate file type
        if not FileValidator.validate_file_type(file_content, category):
            raise HTTPException(status_code=400, detail="Invalid file type")
        
        # Validate file size
        if not FileValidator.validate_file_size(len(file_content), category):
            max_size = FileUploadConfig.MAX_FILE_SIZES[category] / (1024 * 1024)
            raise HTTPException(status_code=400, detail=f"File too large. Maximum size: {max_size}MB")
        
        # Generate unique filename
        file_extension = Path(file.filename).suffix.lower()
        unique_filename = f"{entity_id}_{uuid.uuid4()}{file_extension}"
        file_path = FileUploadConfig.DIRECTORIES[category] / unique_filename
        
        # Save original file
        async with aiofiles.open(file_path, 'wb') as f:
            await f.write(file_content)
        
        # Validate image if it's an image file
        if file_type == "image":
            try:
                with Image.open(file_path) as img:
                    if not FileValidator.validate_image_dimensions(img, category):
                        # Remove invalid file
                        os.unlink(file_path)
                        raise HTTPException(status_code=400, detail="Image dimensions too small")
            except Exception as e:
                # Remove invalid file
                if file_path.exists():
                    os.unlink(file_path)
                raise HTTPException(status_code=400, detail=f"Invalid image file: {str(e)}")
        
        # Process image based on category
        processed_files = {}
        if category == "cars":
            processed_files = ImageProcessor.process_car_image(file_path, entity_id)
        elif category == "avatars":
            processed_files = ImageProcessor.process_avatar_image(file_path, entity_id)
        elif category == "logos":
            processed_files = ImageProcessor.process_logo_image(file_path, entity_id)
        
        return {
            "original_filename": file.filename,
            "saved_filename": unique_filename,
            "file_path": str(file_path.relative_to(FileUploadConfig.UPLOAD_BASE_DIR)),
            "file_size": len(file_content),
            "processed_files": processed_files,
            "category": category,
            "entity_id": entity_id
        }
    
    def delete_file(self, file_path: str) -> bool:
        """Delete a file and its processed variants"""
        try:
            full_path = FileUploadConfig.UPLOAD_BASE_DIR / file_path
            
            if full_path.exists():
                # Delete main file
                os.unlink(full_path)
                
                # Delete processed variants
                base_name = full_path.stem.split('_')[0]  # Get original base name
                parent_dir = full_path.parent
                
                for variant_file in parent_dir.glob(f"{base_name}_*"):
                    try:
                        os.unlink(variant_file)
                    except Exception as e:
                        logger.warning(f"Could not delete variant file {variant_file}: {e}")
                
                return True
                
        except Exception as e:
            logger.error(f"File deletion error: {e}")
            
        return False
    
    def get_file_info(self, file_path: str) -> Optional[Dict[str, any]]:
        """Get information about an uploaded file"""
        try:
            full_path = FileUploadConfig.UPLOAD_BASE_DIR / file_path
            
            if full_path.exists():
                stat = full_path.stat()
                
                info = {
                    "file_path": file_path,
                    "file_size": stat.st_size,
                    "created_at": stat.st_ctime,
                    "modified_at": stat.st_mtime
                }
                
                # Try to get image info
                try:
                    with Image.open(full_path) as img:
                        info.update({
                            "width": img.width,
                            "height": img.height,
                            "format": img.format,
                            "mode": img.mode
                        })
                except Exception:
                    pass
                
                return info
                
        except Exception as e:
            logger.error(f"Get file info error: {e}")
            
        return None

# Global file upload service instance
file_upload_service = FileUploadService()