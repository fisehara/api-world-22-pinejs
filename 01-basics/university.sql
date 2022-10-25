--
-- Create table statements
--

DO $$
BEGIN
	PERFORM '"trigger_update_modified_at"()'::regprocedure;
EXCEPTION WHEN undefined_function THEN
	CREATE FUNCTION "trigger_update_modified_at"()
	RETURNS TRIGGER AS $fn$
	BEGIN
		NEW."modified at" = NOW();
RETURN NEW;
	END;
	$fn$ LANGUAGE plpgsql;
END;
$$;

CREATE TABLE IF NOT EXISTS "subject" (
	"created at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
,	"modified at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
,	"id" SERIAL NOT NULL PRIMARY KEY
,	"name" VARCHAR(255) NOT NULL UNIQUE
,	"credit" INTEGER NULL
);

DO
$$
BEGIN
IF NOT EXISTS(
	SELECT 1
	FROM "information_schema"."triggers"
	WHERE "event_object_table" = 'subject'
	AND "trigger_name" = 'subject_trigger_update_modified_at'
) THEN
	CREATE TRIGGER "subject_trigger_update_modified_at"
	BEFORE UPDATE ON "subject"
	FOR EACH ROW
	EXECUTE PROCEDURE "trigger_update_modified_at"();
END IF;
END;
$$

CREATE TABLE IF NOT EXISTS "campus" (
	"created at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
,	"modified at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
,	"id" SERIAL NOT NULL PRIMARY KEY
,	"name" VARCHAR(255) NOT NULL UNIQUE
);

DO
$$
BEGIN
IF NOT EXISTS(
	SELECT 1
	FROM "information_schema"."triggers"
	WHERE "event_object_table" = 'campus'
	AND "trigger_name" = 'campus_trigger_update_modified_at'
) THEN
	CREATE TRIGGER "campus_trigger_update_modified_at"
	BEFORE UPDATE ON "campus"
	FOR EACH ROW
	EXECUTE PROCEDURE "trigger_update_modified_at"();
END IF;
END;
$$

CREATE TABLE IF NOT EXISTS "campus-offers-subject" (
	"created at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
,	"modified at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
,	"campus" INTEGER NOT NULL
,	"offers-subject" INTEGER NOT NULL
,	"id" SERIAL NOT NULL PRIMARY KEY
,	FOREIGN KEY ("campus") REFERENCES "campus" ("id")
,	FOREIGN KEY ("offers-subject") REFERENCES "subject" ("id")
,	UNIQUE("campus", "offers-subject")
);

DO
$$
BEGIN
IF NOT EXISTS(
	SELECT 1
	FROM "information_schema"."triggers"
	WHERE "event_object_table" = 'campus-offers-subject'
	AND "trigger_name" = 'campus-offers-subject_trigger_update_modified_at'
) THEN
	CREATE TRIGGER "campus-offers-subject_trigger_update_modified_at"
	BEFORE UPDATE ON "campus-offers-subject"
	FOR EACH ROW
	EXECUTE PROCEDURE "trigger_update_modified_at"();
END IF;
END;
$$

CREATE TABLE IF NOT EXISTS "student" (
	"created at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
,	"modified at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
,	"id" SERIAL NOT NULL PRIMARY KEY
,	"name" VARCHAR(255) NOT NULL
,	"last name" VARCHAR(255) NOT NULL
,	"earns-semester credit" INTEGER NULL
);

DO
$$
BEGIN
IF NOT EXISTS(
	SELECT 1
	FROM "information_schema"."triggers"
	WHERE "event_object_table" = 'student'
	AND "trigger_name" = 'student_trigger_update_modified_at'
) THEN
	CREATE TRIGGER "student_trigger_update_modified_at"
	BEFORE UPDATE ON "student"
	FOR EACH ROW
	EXECUTE PROCEDURE "trigger_update_modified_at"();
END IF;
END;
$$

CREATE TABLE IF NOT EXISTS "student-studies-subject" (
	"created at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
,	"modified at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
,	"student" INTEGER NOT NULL
,	"studies-subject" INTEGER NOT NULL
,	"id" SERIAL NOT NULL PRIMARY KEY
,	FOREIGN KEY ("student") REFERENCES "student" ("id")
,	FOREIGN KEY ("studies-subject") REFERENCES "subject" ("id")
,	UNIQUE("student", "studies-subject")
);

DO
$$
BEGIN
IF NOT EXISTS(
	SELECT 1
	FROM "information_schema"."triggers"
	WHERE "event_object_table" = 'student-studies-subject'
	AND "trigger_name" = 'student-studies-subject_trigger_update_modified_at'
) THEN
	CREATE TRIGGER "student-studies-subject_trigger_update_modified_at"
	BEFORE UPDATE ON "student-studies-subject"
	FOR EACH ROW
	EXECUTE PROCEDURE "trigger_update_modified_at"();
END IF;
END;
$$

CREATE TABLE IF NOT EXISTS "student-is member of-campus" (
	"created at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
,	"modified at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
,	"student" INTEGER NOT NULL
,	"is member of-campus" INTEGER NOT NULL
,	"id" SERIAL NOT NULL PRIMARY KEY
,	FOREIGN KEY ("student") REFERENCES "student" ("id")
,	FOREIGN KEY ("is member of-campus") REFERENCES "campus" ("id")
,	UNIQUE("student", "is member of-campus")
);

DO
$$
BEGIN
IF NOT EXISTS(
	SELECT 1
	FROM "information_schema"."triggers"
	WHERE "event_object_table" = 'student-is member of-campus'
	AND "trigger_name" = 'student-is member of-campus_trigger_update_modified_at'
) THEN
	CREATE TRIGGER "student-is member of-campus_trigger_update_modified_at"
	BEFORE UPDATE ON "student-is member of-campus"
	FOR EACH ROW
	EXECUTE PROCEDURE "trigger_update_modified_at"();
END IF;
END;
$$

CREATE TABLE IF NOT EXISTS "professor" (
	"created at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
,	"modified at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
,	"id" SERIAL NOT NULL PRIMARY KEY
,	"name" VARCHAR(255) NOT NULL
,	"last name" VARCHAR(255) NOT NULL
);

DO
$$
BEGIN
IF NOT EXISTS(
	SELECT 1
	FROM "information_schema"."triggers"
	WHERE "event_object_table" = 'professor'
	AND "trigger_name" = 'professor_trigger_update_modified_at'
) THEN
	CREATE TRIGGER "professor_trigger_update_modified_at"
	BEFORE UPDATE ON "professor"
	FOR EACH ROW
	EXECUTE PROCEDURE "trigger_update_modified_at"();
END IF;
END;
$$

CREATE TABLE IF NOT EXISTS "professor-teaches-subject" (
	"created at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
,	"modified at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
,	"professor" INTEGER NOT NULL
,	"teaches-subject" INTEGER NOT NULL
,	"id" SERIAL NOT NULL PRIMARY KEY
,	FOREIGN KEY ("professor") REFERENCES "professor" ("id")
,	FOREIGN KEY ("teaches-subject") REFERENCES "subject" ("id")
,	UNIQUE("professor", "teaches-subject")
);

DO
$$
BEGIN
IF NOT EXISTS(
	SELECT 1
	FROM "information_schema"."triggers"
	WHERE "event_object_table" = 'professor-teaches-subject'
	AND "trigger_name" = 'professor-teaches-subject_trigger_update_modified_at'
) THEN
	CREATE TRIGGER "professor-teaches-subject_trigger_update_modified_at"
	BEFORE UPDATE ON "professor-teaches-subject"
	FOR EACH ROW
	EXECUTE PROCEDURE "trigger_update_modified_at"();
END IF;
END;
$$

CREATE TABLE IF NOT EXISTS "professor-is head of-campus" (
	"created at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
,	"modified at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
,	"professor" INTEGER NOT NULL
,	"is head of-campus" INTEGER NOT NULL
,	"id" SERIAL NOT NULL PRIMARY KEY
,	FOREIGN KEY ("professor") REFERENCES "professor" ("id")
,	FOREIGN KEY ("is head of-campus") REFERENCES "campus" ("id")
,	UNIQUE("professor", "is head of-campus")
);

DO
$$
BEGIN
IF NOT EXISTS(
	SELECT 1
	FROM "information_schema"."triggers"
	WHERE "event_object_table" = 'professor-is head of-campus'
	AND "trigger_name" = 'professor-is head of-campus_trigger_update_modified_at'
) THEN
	CREATE TRIGGER "professor-is head of-campus_trigger_update_modified_at"
	BEFORE UPDATE ON "professor-is head of-campus"
	FOR EACH ROW
	EXECUTE PROCEDURE "trigger_update_modified_at"();
END IF;
END;
$$

--
-- Rule validation queries
--

-- It is necessary that each student that earns a semester credit, earns a semester credit that is greater than or equal to 1 and is less than or equal to 16.
SELECT NOT EXISTS (
	SELECT 1
	FROM "student" AS "student.0"
	WHERE "student.0"."earns-semester credit" IS NOT NULL
	AND NOT (
		1 <= "student.0"."earns-semester credit"
		AND "student.0"."earns-semester credit" <= 16
		AND "student.0"."earns-semester credit" IS NOT NULL
	)
) AS "result";

-- It is necessary that each student that is member of a campus that offers a subject1, studies the subject1.
SELECT NOT EXISTS (
	SELECT 1
	FROM "student" AS "student.0",
		"campus" AS "campus.1",
		"subject" AS "subject.2",
		"campus-offers-subject" AS "campus.1-offers-subject.2",
		"student-is member of-campus" AS "student.0-is member of-campus.1"
	WHERE "campus.1-offers-subject.2"."campus" = "campus.1"."id"
	AND "campus.1-offers-subject.2"."offers-subject" = "subject.2"."id"
	AND "student.0-is member of-campus.1"."student" = "student.0"."id"
	AND "student.0-is member of-campus.1"."is member of-campus" = "campus.1"."id"
	AND NOT EXISTS (
		SELECT 1
		FROM "student-studies-subject" AS "student.0-studies-subject.2"
		WHERE "student.0-studies-subject.2"."student" = "student.0"."id"
		AND "student.0-studies-subject.2"."studies-subject" = "subject.2"."id"
	)
) AS "result";
