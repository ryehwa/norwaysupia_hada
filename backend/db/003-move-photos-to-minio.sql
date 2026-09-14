-- 사진 저장소를 로컬 파일시스템에서 MinIO 로 옮길 때 한 번만 실행한다.
--
-- 바뀌는 것: url(/uploads/2026/09/abc.jpg) + storage_path(서버 절대경로) 두 컬럼이
-- object_key(2026/09/abc.jpg) 하나로 합쳐진다. 조회용 URL 은 만료가 있는
-- presigned URL 이라 더는 DB 에 담지 않는다.
--
-- 전환 시점에 사진이 한 장도 없었으므로 옮길 파일은 없다. 그래도 이 스크립트는
-- 반드시 실행해야 한다. 행이 비어 있어도 url 컬럼의 NOT NULL 제약은 남아 있어서,
-- url 을 더는 쓰지 않는 새 코드가 사진을 올리면 INSERT 가 제약 위반으로 실패한다.
--
-- 실행 순서: 새 코드를 배포하기 전에 이 스크립트를 먼저 돌린다.
-- (아래 UPDATE 는 행이 있을 때만 의미가 있고, 없으면 그냥 넘어간다.)

ALTER TABLE project_photos ADD COLUMN IF NOT EXISTS object_key varchar(500);

-- url 앞의 /uploads/ 만 떼면 그대로 오브젝트 키가 된다.
UPDATE project_photos
   SET object_key = regexp_replace(url, '^/uploads/', '')
 WHERE object_key IS NULL;

ALTER TABLE project_photos ALTER COLUMN object_key SET NOT NULL;

ALTER TABLE project_photos DROP COLUMN IF EXISTS url;
ALTER TABLE project_photos DROP COLUMN IF EXISTS storage_path;
