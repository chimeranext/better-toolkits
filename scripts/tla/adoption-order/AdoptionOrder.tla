---- MODULE AdoptionOrder ----
EXTENDS Naturals, Sequences

ORD == << "DSMS", "IFS", "CPS", "PRDS", "BrS", "WTD", "GGT", "QT4L",
          "AFIF", "OST", "CHH", "SemVer", "MPH", "BGI", "ODT", "NSQ",
          "TFM", "REL", "LTGT" >>

DEPS_FROM == <<"GGT","GGT","MPH","MPH","NSQ","REL","REL","REL","REL","REL","LTGT","LTGT","LTGT">>
DEPS_TO == <<"BrS","WTD","BrS","SemVer","MPH","GGT","MPH","QT4L","SemVer","CHH","WTD","GGT","TFM">>

Pos(s) == CHOOSE i \in DOMAIN ORD : ORD[i] = s

COMPS == { <<"PRDS","BrS">>, <<"PRDS","QT4L">> }

Prop == \A i \in DOMAIN DEPS_FROM : Pos(DEPS_FROM[i]) > Pos(DEPS_TO[i])

ASSUME Prop

====
