---- MODULE AdoptionOrder ----
EXTENDS Naturals, Sequences

ORD == << "DSMS", "IFS", "CPS", "PRDS", "BrS", "WTD", "GGT", "QT4L",
          "AFIF", "OST", "CHH", "SemVer", "MPH", "BGI", "ODT", "NSQ" >>

DEPS_FROM == <<"GGT","GGT","MPH","MPH","NSQ">>
DEPS_TO == <<"BrS","WTD","BrS","SemVer","MPH">>

Pos(s) == CHOOSE i \in DOMAIN ORD : ORD[i] = s

Prop == \A i \in DOMAIN DEPS_FROM : Pos(DEPS_FROM[i]) > Pos(DEPS_TO[i])

ASSUME Prop

====
