import os
from typing import Optional, Dict, Any
from botocore.config import Config

try:
    import boto3
    BOTO3_AVAILABLE = True
except ImportError:
    boto3 = None
    BOTO3_AVAILABLE = False

# Helper to load from .env.local if not already in os.environ
def _load_env_fallback():
    if not os.environ.get("R2_ACCESS_KEY_ID"):
        env_local_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../.env.local"))
        if os.path.exists(env_local_path):
            with open(env_local_path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line.startswith("#") or "=" not in line:
                        continue
                    key, val = line.split("=", 1)
                    key = key.strip()
                    val = val.strip().strip('"').strip("'")
                    if key not in os.environ:
                        os.environ[key] = val

_load_env_fallback()

R2_ACCOUNT_ID = os.environ.get("R2_ACCOUNT_ID", "8bbfdf863607f033e85be55182ba64bc")
R2_ACCESS_KEY_ID = os.environ.get("R2_ACCESS_KEY_ID", "05579cc3afe9f3d4d7979e85620ccbc0")
R2_SECRET_ACCESS_KEY = os.environ.get("R2_SECRET_ACCESS_KEY", "465c8322030a32dff8bc91f9b7678df32b28a3251322253464d8194896f13679")
R2_ENDPOINT_URL = os.environ.get("R2_ENDPOINT_URL", f"https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com")
R2_BUCKET_NAME = os.environ.get("R2_BUCKET_NAME", "wellness-reports")

def is_configured() -> bool:
    return bool(BOTO3_AVAILABLE and R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY and R2_ENDPOINT_URL)

def get_s3_client():
    if not is_configured():
        return None
    return boto3.client(
        "s3",
        endpoint_url=R2_ENDPOINT_URL,
        aws_access_key_id=R2_ACCESS_KEY_ID,
        aws_secret_access_key=R2_SECRET_ACCESS_KEY,
        config=Config(signature_version="s3v4"),
        region_name="auto"
    )

def upload_file(file_content: bytes, object_key: str, content_type: str = "application/pdf") -> Optional[str]:
    """
    Uploads file bytes to Cloudflare R2 and returns a presigned URL valid for 24 hours.
    """
    s3 = get_s3_client()
    if not s3:
        print("[R2 Storage] boto3 or R2 credentials missing")
        return None
    try:
        s3.put_object(
            Bucket=R2_BUCKET_NAME,
            Key=object_key,
            Body=file_content,
            ContentType=content_type
        )
        return generate_download_url(object_key, expires_in=86400)
    except Exception as e:
        print(f"[R2 Storage Error] Failed to upload {object_key}: {e}")
        return None

def generate_download_url(object_key: str, expires_in: int = 86400) -> Optional[str]:
    """
    Generates a secure presigned GET URL for the specified object key in R2.
    """
    s3 = get_s3_client()
    if not s3:
        return None
    try:
        url = s3.generate_presigned_url(
            "get_object",
            Params={"Bucket": R2_BUCKET_NAME, "Key": object_key},
            ExpiresIn=expires_in
        )
        return url
    except Exception as e:
        print(f"[R2 Storage Error] Failed to generate presigned URL for {object_key}: {e}")
        return None

def delete_file(object_key: str) -> bool:
    """
    Deletes an object from Cloudflare R2 bucket.
    """
    s3 = get_s3_client()
    if not s3:
        return False
    try:
        s3.delete_object(Bucket=R2_BUCKET_NAME, Key=object_key)
        return True
    except Exception as e:
        print(f"[R2 Storage Error] Failed to delete {object_key}: {e}")
        return False
